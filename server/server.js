const express = require('express')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()
app.use(express.json({ limit: '1mb' }))

const PORT = Number(process.env.PORT || 3000)
const SITE_NAME = process.env.SITE_NAME || 'Venom Kazino'
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || ''
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || ''
const ADMIN_GIFT_USERNAME = process.env.TELEGRAM_ADMIN_GIFT_USERNAME || ''
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || ''
const DEPOSIT_MODE = process.env.DEPOSIT_MODE || 'invoice'
const WITHDRAW_FEE_PERCENT = Number(process.env.WITHDRAW_FEE_PERCENT || 8)
const ALLOW_DEV_AUTH = String(process.env.ALLOW_DEV_AUTH || 'true') === 'true'
const WEBHOOK_BASE_URL = process.env.WEBHOOK_BASE_URL || ''
const MONGODB_URI = process.env.MONGODB_URI || ''
const memoryMode = !MONGODB_URI

let UserModel
let DepositModel
let WithdrawalModel
let TransactionModel

const memory = {
  users: new Map(),
  deposits: new Map(),
  withdrawals: new Map(),
  transactions: [],
}

function publicConfig() {
  return {
    siteName: SITE_NAME,
    botUsername: BOT_USERNAME || undefined,
    adminGiftUsername: ADMIN_GIFT_USERNAME || undefined,
    depositMode: DEPOSIT_MODE,
    withdrawFeePercent: WITHDRAW_FEE_PERCENT,
  }
}

function nowIso() {
  return new Date().toISOString()
}

function makeId(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`
}

function pickUserSnapshot(user) {
  return {
    telegramId: user.telegramId,
    username: user.username || '',
    displayName: user.displayName,
    firstName: user.firstName,
    lastName: user.lastName || '',
    balance: user.balance,
  }
}

async function connectDbIfNeeded() {
  if (memoryMode) {
    console.log('[server] Memory mode active. Set MONGODB_URI for MongoDB persistence.')
    return
  }

  await mongoose.connect(MONGODB_URI)

  const userSchema = new mongoose.Schema(
    {
      telegramId: { type: Number, unique: true, index: true, required: true },
      username: String,
      firstName: String,
      lastName: String,
      displayName: String,
      photoUrl: String,
      languageCode: String,
      balance: { type: Number, default: 0 },
      totalDeposited: { type: Number, default: 0 },
      totalWithdrawn: { type: Number, default: 0 },
      lastLoginAt: String,
    },
    { timestamps: true },
  )

  const depositSchema = new mongoose.Schema(
    {
      requestId: { type: String, unique: true, index: true },
      telegramId: { type: Number, index: true, required: true },
      amount: Number,
      status: { type: String, default: 'pending' },
      method: String,
      invoicePayload: String,
      telegramPaymentChargeId: String,
      fromTelegramId: Number,
      userSnapshot: Object,
      externalId: String,
    },
    { timestamps: true },
  )

  const withdrawalSchema = new mongoose.Schema(
    {
      requestId: { type: String, unique: true, index: true },
      telegramId: { type: Number, index: true, required: true },
      amount: Number,
      feePercent: Number,
      feeAmount: Number,
      netAmount: Number,
      status: { type: String, default: 'pending' },
      userSnapshot: Object,
      externalId: String,
    },
    { timestamps: true },
  )

  const transactionSchema = new mongoose.Schema(
    {
      transactionId: { type: String, unique: true, index: true },
      telegramId: { type: Number, index: true, required: true },
      kind: String,
      amount: Number,
      balanceBefore: Number,
      balanceAfter: Number,
      reason: String,
      meta: Object,
      externalId: String,
    },
    { timestamps: true },
  )

  UserModel = mongoose.models.VenomUser || mongoose.model('VenomUser', userSchema)
  DepositModel = mongoose.models.VenomDeposit || mongoose.model('VenomDeposit', depositSchema)
  WithdrawalModel = mongoose.models.VenomWithdrawal || mongoose.model('VenomWithdrawal', withdrawalSchema)
  TransactionModel = mongoose.models.VenomTransaction || mongoose.model('VenomTransaction', transactionSchema)

  console.log('[server] MongoDB connected')
}

async function getUserByTelegramId(telegramId) {
  if (memoryMode) {
    return memory.users.get(Number(telegramId)) || null
  }
  return UserModel.findOne({ telegramId: Number(telegramId) }).lean()
}

async function upsertTelegramUser(profile) {
  const base = {
    telegramId: Number(profile.id || profile.telegramId),
    username: profile.username || '',
    firstName: profile.first_name || profile.firstName || 'Telegram',
    lastName: profile.last_name || profile.lastName || '',
    displayName:
      [profile.first_name || profile.firstName, profile.last_name || profile.lastName]
        .filter(Boolean)
        .join(' ') || profile.username || `user_${profile.id || profile.telegramId}`,
    photoUrl: profile.photo_url || profile.photoUrl || '',
    languageCode: profile.language_code || profile.languageCode || 'az',
    lastLoginAt: nowIso(),
  }

  if (memoryMode) {
    const existing = memory.users.get(base.telegramId) || {
      telegramId: base.telegramId,
      balance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      createdAt: nowIso(),
    }
    const merged = { ...existing, ...base, updatedAt: nowIso() }
    memory.users.set(base.telegramId, merged)
    return merged
  }

  const result = await UserModel.findOneAndUpdate(
    { telegramId: base.telegramId },
    { $set: base, $setOnInsert: { balance: 0, totalDeposited: 0, totalWithdrawn: 0 } },
    { new: true, upsert: true, lean: true },
  )
  return result
}

async function createTransaction({ telegramId, kind, amount, balanceBefore, balanceAfter, reason, meta, externalId }) {
  const payload = {
    transactionId: makeId('txn'),
    telegramId: Number(telegramId),
    kind,
    amount,
    balanceBefore,
    balanceAfter,
    reason,
    meta: meta || {},
    externalId: externalId || '',
    createdAt: nowIso(),
  }

  if (memoryMode) {
    memory.transactions.push(payload)
    return payload
  }

  return TransactionModel.create(payload)
}

async function syncUserBalanceAbsolute(telegramId, nextBalance, reason = 'sync', meta = {}) {
  const user = await getUserByTelegramId(telegramId)
  if (!user) throw new Error('İstifadəçi tapılmadı')
  const safeBalance = Math.max(0, Number(nextBalance || 0))
  const previous = Number(user.balance || 0)

  if (memoryMode) {
    const updated = { ...user, balance: safeBalance, updatedAt: nowIso() }
    memory.users.set(Number(telegramId), updated)
    await createTransaction({
      telegramId,
      kind: 'balance_sync',
      amount: safeBalance - previous,
      balanceBefore: previous,
      balanceAfter: safeBalance,
      reason,
      meta,
    })
    return updated
  }

  const updated = await UserModel.findOneAndUpdate(
    { telegramId: Number(telegramId) },
    { $set: { balance: safeBalance } },
    { new: true, lean: true },
  )

  await createTransaction({
    telegramId,
    kind: 'balance_sync',
    amount: safeBalance - previous,
    balanceBefore: previous,
    balanceAfter: safeBalance,
    reason,
    meta,
  })

  return updated
}

async function createDepositRecord({ telegramId, amount, method, invoicePayload = '', externalId = '' }) {
  const user = await getUserByTelegramId(telegramId)
  if (!user) throw new Error('İstifadəçi tapılmadı')

  const payload = {
    requestId: makeId('dep'),
    telegramId: Number(telegramId),
    amount: Number(amount),
    status: 'pending',
    method,
    invoicePayload,
    userSnapshot: pickUserSnapshot(user),
    externalId,
    createdAt: nowIso(),
  }

  if (memoryMode) {
    memory.deposits.set(payload.requestId, payload)
    return payload
  }

  const created = await DepositModel.create(payload)
  return created.toObject()
}

async function getDepositByRequestId(requestId) {
  if (memoryMode) return memory.deposits.get(requestId) || null
  return DepositModel.findOne({ requestId }).lean()
}

async function markDepositPaid({ requestId, paymentChargeId = '', fromTelegramId = 0, externalId = '' }) {
  const deposit = await getDepositByRequestId(requestId)
  if (!deposit) throw new Error('Depozit sorğusu tapılmadı')
  if (deposit.status === 'paid') return deposit

  const user = await getUserByTelegramId(deposit.telegramId)
  if (!user) throw new Error('İstifadəçi tapılmadı')
  const previous = Number(user.balance || 0)
  const next = previous + Number(deposit.amount || 0)

  if (memoryMode) {
    const updatedDeposit = {
      ...deposit,
      status: 'paid',
      telegramPaymentChargeId: paymentChargeId,
      fromTelegramId: Number(fromTelegramId || 0),
      externalId,
      updatedAt: nowIso(),
    }
    memory.deposits.set(requestId, updatedDeposit)
    memory.users.set(Number(user.telegramId), {
      ...user,
      balance: next,
      totalDeposited: Number(user.totalDeposited || 0) + Number(deposit.amount || 0),
      updatedAt: nowIso(),
    })
    await createTransaction({
      telegramId: user.telegramId,
      kind: 'deposit',
      amount: Number(deposit.amount || 0),
      balanceBefore: previous,
      balanceAfter: next,
      reason: deposit.method === 'gift' ? 'gift-credit' : 'invoice-credit',
      externalId,
      meta: { requestId },
    })
    return updatedDeposit
  }

  await DepositModel.updateOne(
    { requestId },
    {
      $set: {
        status: 'paid',
        telegramPaymentChargeId: paymentChargeId,
        fromTelegramId: Number(fromTelegramId || 0),
        externalId,
      },
    },
  )

  await UserModel.updateOne(
    { telegramId: user.telegramId },
    {
      $set: { balance: next },
      $inc: { totalDeposited: Number(deposit.amount || 0) },
    },
  )

  await createTransaction({
    telegramId: user.telegramId,
    kind: 'deposit',
    amount: Number(deposit.amount || 0),
    balanceBefore: previous,
    balanceAfter: next,
    reason: deposit.method === 'gift' ? 'gift-credit' : 'invoice-credit',
    externalId,
    meta: { requestId },
  })

  return getDepositByRequestId(requestId)
}

async function createWithdrawalRecord({ telegramId, amount }) {
  const user = await getUserByTelegramId(telegramId)
  if (!user) throw new Error('İstifadəçi tapılmadı')

  const numericAmount = Number(amount || 0)
  if (numericAmount <= 0) throw new Error('Məbləğ düzgün deyil')
  if (Number(user.balance || 0) < numericAmount) throw new Error('Balans kifayət etmir')

  const feeAmount = Number(((numericAmount * WITHDRAW_FEE_PERCENT) / 100).toFixed(2))
  const netAmount = Number((numericAmount - feeAmount).toFixed(2))
  const balanceAfter = Number((Number(user.balance || 0) - numericAmount).toFixed(2))

  const payload = {
    requestId: makeId('wd'),
    telegramId: Number(telegramId),
    amount: numericAmount,
    feePercent: WITHDRAW_FEE_PERCENT,
    feeAmount,
    netAmount,
    status: 'pending',
    userSnapshot: pickUserSnapshot(user),
    createdAt: nowIso(),
  }

  if (memoryMode) {
    memory.withdrawals.set(payload.requestId, payload)
    memory.users.set(Number(telegramId), {
      ...user,
      balance: balanceAfter,
      totalWithdrawn: Number(user.totalWithdrawn || 0) + netAmount,
      updatedAt: nowIso(),
    })
    await createTransaction({
      telegramId,
      kind: 'withdraw_request',
      amount: -numericAmount,
      balanceBefore: Number(user.balance || 0),
      balanceAfter,
      reason: 'withdraw-request',
      meta: { requestId: payload.requestId, feeAmount, netAmount },
    })
    return payload
  }

  await WithdrawalModel.create(payload)
  await UserModel.updateOne(
    { telegramId: Number(telegramId) },
    { $set: { balance: balanceAfter }, $inc: { totalWithdrawn: netAmount } },
  )
  await createTransaction({
    telegramId,
    kind: 'withdraw_request',
    amount: -numericAmount,
    balanceBefore: Number(user.balance || 0),
    balanceAfter,
    reason: 'withdraw-request',
    meta: { requestId: payload.requestId, feeAmount, netAmount },
  })

  return payload
}

function parseInitData(initData) {
  const params = new URLSearchParams(initData)
  const data = Object.fromEntries(params.entries())
  if (data.user) {
    try {
      data.user = JSON.parse(data.user)
    } catch {
      data.user = null
    }
  }
  return data
}

function verifyTelegramInitData(initData) {
  if (!BOT_TOKEN) return false
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) return false
  params.delete('hash')
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')
  const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest()
  const digest = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex')
  return digest === hash
}

async function telegramApi(method, payload) {
  if (!BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN təyin edilməyib')
  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok || !data.ok) {
    throw new Error(data.description || `${method} xətası`)
  }
  return data.result
}

async function createInvoiceLink({ telegramId, requestId, amount }) {
  const payload = `deposit:${telegramId}:${requestId}:${amount}`
  return telegramApi('createInvoiceLink', {
    title: `${SITE_NAME} Deposit`,
    description: `${SITE_NAME} balans artırılması`,
    payload,
    currency: 'XTR',
    prices: [{ label: 'Balance Deposit', amount: Number(amount) }],
    provider_token: '',
  })
}

async function answerPreCheckoutQuery(preCheckoutQueryId, ok, errorMessage = '') {
  return telegramApi('answerPreCheckoutQuery', {
    pre_checkout_query_id: preCheckoutQueryId,
    ok,
    error_message: errorMessage || undefined,
  })
}

async function sendAdminMessage(text) {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) return false
  try {
    await telegramApi('sendMessage', {
      chat_id: ADMIN_CHAT_ID,
      text,
    })
    return true
  } catch (error) {
    console.error('[telegram admin notify error]', error.message)
    return false
  }
}

async function setupWebhook() {
  if (!BOT_TOKEN || !WEBHOOK_BASE_URL) return
  const url = `${WEBHOOK_BASE_URL.replace(/\/$/, '')}/api/telegram/webhook`
  try {
    await telegramApi('setWebhook', { url })
    console.log(`[server] Telegram webhook set: ${url}`)
  } catch (error) {
    console.error('[server] setWebhook failed:', error.message)
  }
}

app.get('/api/health', async (_req, res) => {
  res.json({ ok: true, memoryMode, siteName: SITE_NAME, time: nowIso() })
})

app.get('/api/config/public', (_req, res) => {
  res.json(publicConfig())
})

app.post('/api/auth/telegram', async (req, res) => {
  try {
    const initData = String(req.body?.initData || '')
    if (!initData) return res.status(400).json({ error: 'initData tələb olunur' })
    if (!verifyTelegramInitData(initData)) {
      return res.status(401).json({ error: 'Telegram doğrulaması alınmadı' })
    }
    const parsed = parseInitData(initData)
    if (!parsed.user?.id) {
      return res.status(400).json({ error: 'Telegram istifadəçi məlumatı yoxdur' })
    }
    const user = await upsertTelegramUser(parsed.user)
    res.json({ user, config: publicConfig() })
  } catch (error) {
    console.error('[auth telegram error]', error)
    res.status(500).json({ error: 'Telegram giriş xətası' })
  }
})

app.post('/api/auth/dev', async (req, res) => {
  try {
    if (!ALLOW_DEV_AUTH) {
      return res.status(403).json({ error: 'Dev auth deaktivdir' })
    }
    const { telegramId, firstName, username } = req.body || {}
    if (!telegramId || !firstName) {
      return res.status(400).json({ error: 'telegramId və firstName tələb olunur' })
    }
    const user = await upsertTelegramUser({
      id: Number(telegramId),
      first_name: String(firstName),
      username: username ? String(username) : '',
    })
    res.json({ user, config: publicConfig() })
  } catch (error) {
    console.error('[auth dev error]', error)
    res.status(500).json({ error: 'Dev giriş xətası' })
  }
})

app.get('/api/users/:telegramId', async (req, res) => {
  try {
    const user = await getUserByTelegramId(req.params.telegramId)
    if (!user) return res.status(404).json({ error: 'İstifadəçi tapılmadı' })
    res.json({ user, config: publicConfig() })
  } catch (error) {
    console.error('[get user error]', error)
    res.status(500).json({ error: 'İstifadəçi sorğusu xətası' })
  }
})

app.post('/api/balance/sync', async (req, res) => {
  try {
    const { telegramId, balance, reason, meta } = req.body || {}
    if (!telegramId && telegramId !== 0) {
      return res.status(400).json({ error: 'telegramId tələb olunur' })
    }
    const user = await syncUserBalanceAbsolute(telegramId, balance, reason, meta)
    res.json({ ok: true, user })
  } catch (error) {
    console.error('[balance sync error]', error)
    res.status(500).json({ error: error.message || 'Balans sinxronizasiya xətası' })
  }
})

app.post('/api/deposits/request', async (req, res) => {
  try {
    const { telegramId, amount } = req.body || {}
    const numericAmount = Number(amount || 0)
    if (!telegramId) return res.status(400).json({ error: 'telegramId tələb olunur' })
    if (!numericAmount || numericAmount <= 0) return res.status(400).json({ error: 'Məbləğ düzgün deyil' })

    const method = DEPOSIT_MODE === 'gift' ? 'gift' : 'invoice'
    const record = await createDepositRecord({ telegramId, amount: numericAmount, method })

    if ((DEPOSIT_MODE === 'invoice' || DEPOSIT_MODE === 'invoice_or_gift') && BOT_TOKEN) {
      const invoiceLink = await createInvoiceLink({ telegramId, requestId: record.requestId, amount: numericAmount })
      if (memoryMode) {
        const existing = memory.deposits.get(record.requestId)
        memory.deposits.set(record.requestId, { ...existing, invoicePayload: `deposit:${telegramId}:${record.requestId}:${numericAmount}` })
      } else {
        await DepositModel.updateOne(
          { requestId: record.requestId },
          { $set: { invoicePayload: `deposit:${telegramId}:${record.requestId}:${numericAmount}` } },
        )
      }

      return res.json({
        ok: true,
        mode: DEPOSIT_MODE,
        requestId: record.requestId,
        amount: numericAmount,
        invoiceLink,
        botUsername: BOT_USERNAME || undefined,
        adminGiftUsername: ADMIN_GIFT_USERNAME || undefined,
        message: 'Invoice yaradıldı',
      })
    }

    res.json({
      ok: true,
      mode: DEPOSIT_MODE,
      requestId: record.requestId,
      amount: numericAmount,
      adminGiftUsername: ADMIN_GIFT_USERNAME || undefined,
      message: ADMIN_GIFT_USERNAME
        ? `Gift üsulu aktivdir. @${ADMIN_GIFT_USERNAME} hesabına ${numericAmount} Stars göndərin. Userbot inteqrasiyası ilə kreditləşdirmə edilə bilər.`
        : 'Gift üsulu aktivdir. Admin gift hesabı konfiqurasiya edilməyib.',
    })
  } catch (error) {
    console.error('[deposit request error]', error)
    res.status(500).json({ error: error.message || 'Depozit sorğusu yaradılmadı' })
  }
})

app.post('/api/deposits/gift-credit', async (req, res) => {
  try {
    if (!ADMIN_API_KEY || req.headers['x-admin-key'] !== ADMIN_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const { requestId, fromTelegramId, externalId } = req.body || {}
    if (!requestId) return res.status(400).json({ error: 'requestId tələb olunur' })
    const deposit = await markDepositPaid({ requestId, fromTelegramId, externalId, paymentChargeId: '' })
    const user = await getUserByTelegramId(deposit.telegramId)
    await sendAdminMessage(`Gift deposit təsdiqləndi\nUser: ${user.displayName} (@${user.username || '-'})\nID: ${user.telegramId}\nMəbləğ: ${deposit.amount} ⭐\nVaxt: ${new Date().toLocaleString('az-AZ', { hour12: false })}`)
    res.json({ ok: true, deposit, user })
  } catch (error) {
    console.error('[gift credit error]', error)
    res.status(500).json({ error: error.message || 'Gift kredit xətası' })
  }
})

app.post('/api/withdrawals/request', async (req, res) => {
  try {
    const { telegramId, amount } = req.body || {}
    if (!telegramId) return res.status(400).json({ error: 'telegramId tələb olunur' })

    const withdrawal = await createWithdrawalRecord({ telegramId, amount })
    const user = await getUserByTelegramId(telegramId)
    const message = [
      'Yeni çıxarış sorğusu',
      `User ID: ${user.telegramId}`,
      `Tag: @${user.username || '-'}`,
      `İstifadəçi adı: ${user.displayName}`,
      `Çıxarış məbləği: ${withdrawal.amount} ⭐`,
      `Komissiya: ${withdrawal.feeAmount} ⭐ (${withdrawal.feePercent}%)`,
      `Net məbləğ: ${withdrawal.netAmount} ⭐`,
      `Saat/Tarix: ${new Date().toLocaleString('az-AZ', { hour12: false })}`,
      `Sorğu ID: ${withdrawal.requestId}`,
    ].join('\n')
    await sendAdminMessage(message)

    res.json({
      ok: true,
      requestId: withdrawal.requestId,
      amount: withdrawal.amount,
      feeAmount: withdrawal.feeAmount,
      netAmount: withdrawal.netAmount,
      status: withdrawal.status,
    })
  } catch (error) {
    console.error('[withdraw request error]', error)
    res.status(500).json({ error: error.message || 'Çıxarış sorğusu yaradılmadı' })
  }
})

app.post('/api/telegram/webhook', async (req, res) => {
  try {
    const update = req.body || {}

    if (update.pre_checkout_query) {
      await answerPreCheckoutQuery(update.pre_checkout_query.id, true)
      return res.json({ ok: true })
    }

    const successfulPayment = update.message?.successful_payment
    if (successfulPayment && successfulPayment.currency === 'XTR') {
      const payload = String(successfulPayment.invoice_payload || '')
      const [type, telegramId, requestId] = payload.split(':')
      if (type === 'deposit' && requestId) {
        const deposit = await markDepositPaid({
          requestId,
          paymentChargeId: successfulPayment.telegram_payment_charge_id,
          externalId: successfulPayment.provider_payment_charge_id || '',
        })
        const user = await getUserByTelegramId(Number(telegramId || deposit.telegramId))
        await sendAdminMessage(
          `Yeni deposit\nUser: ${user.displayName} (@${user.username || '-'})\nID: ${user.telegramId}\nMəbləğ: ${deposit.amount} ⭐\nSorğu ID: ${requestId}\nVaxt: ${new Date().toLocaleString('az-AZ', { hour12: false })}`,
        )
      }
    }

    res.json({ ok: true })
  } catch (error) {
    console.error('[telegram webhook error]', error)
    res.status(500).json({ error: 'Webhook xətası' })
  }
})

const distDir = path.join(__dirname, '..', 'dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next()
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

connectDbIfNeeded()
  .then(setupWebhook)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[server] ${SITE_NAME} listening on :${PORT}`)
    })
  })
  .catch((error) => {
    console.error('[server] Startup failed:', error)
    process.exit(1)
  })
