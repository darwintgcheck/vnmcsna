require('dotenv').config();
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
const MONGODB_URI = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/king-casino').trim();
const SITE_NAME = process.env.SITE_NAME || 'King Casino';
const BOT_USERNAME = (process.env.TELEGRAM_BOT_USERNAME || '').replace(/^@/, '');
const ADMIN_GIFT_USERNAME = (process.env.ADMIN_GIFT_USERNAME || '').replace(/^@/, '');
const WITHDRAW_FEE_PERCENT = normalizeNumber(process.env.WITHDRAW_FEE_PERCENT || 8, { min: 0, max: 100, fallback: 8 });
const ALLOW_DEV_AUTH = process.env.ALLOW_DEV_AUTH === 'true' || process.env.NODE_ENV !== 'production';
const ADMIN_USERS_PAGE_SIZE = 8;
const CRASH_PRESENCE_TTL_MS = 45_000;
const MINIAPP_AUTH_TTL_SECONDS = 60 * 60 * 24 * 7;

const ADMIN_TELEGRAM_IDS = new Set(
  String(process.env.ADMIN_TELEGRAM_IDS || '')
    .split(',')
    .map((value) => normalizeNumber(value.trim(), { min: 1, integerOnly: true, fallback: 0 }))
    .filter(Boolean),
);

app.use(express.json({ limit: '100kb' }));
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

function nowIso() {
  return new Date().toISOString();
}

function escapeHtml(value = '') {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function normalizeNumber(value, options = {}) {
  const {
    min = 0,
    max = Number.MAX_SAFE_INTEGER,
    fallback = 0,
    integerOnly = false,
    precision = 2,
  } = options;

  const raw = Number(value);
  if (!Number.isFinite(raw)) return fallback;
  const rounded = integerOnly ? Math.trunc(raw) : Number(raw.toFixed(precision));
  if (rounded < min || rounded > max) return fallback;
  return rounded;
}

let mongoPromise = null;
async function ensureMongo() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!mongoPromise) {
    mongoPromise = mongoose
      .connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10_000,
        autoIndex: true,
      })
      .finally(() => {
        mongoPromise = null;
      });
  }
  await mongoPromise;
  return mongoose.connection;
}

const userSchema = new mongoose.Schema(
  {
    telegramId: { type: Number, required: true, unique: true, index: true },
    username: String,
    firstName: { type: String, default: 'Telegram' },
    lastName: String,
    displayName: { type: String, default: 'Telegram User' },
    photoUrl: String,
    languageCode: String,
    balance: { type: Number, default: 0 },
    blocked: { type: Boolean, default: false },
    totalDeposited: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
    createdAt: { type: String, default: nowIso },
    lastLoginAt: { type: String, default: nowIso },
  },
  { versionKey: false },
);

const depositSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    telegramId: { type: Number, required: true, index: true },
    amount: { type: Number, required: true },
    title: String,
    description: String,
    payload: String,
    invoiceLink: String,
    status: { type: String, default: 'pending', index: true },
    createdAt: { type: String, default: nowIso },
    updatedAt: { type: String, default: nowIso },
    paidAt: String,
    telegramPaymentChargeId: String,
    providerPaymentChargeId: String,
    paidAmount: Number,
  },
  { versionKey: false },
);

const withdrawalSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    telegramId: { type: Number, required: true, index: true },
    amount: { type: Number, required: true },
    feeAmount: { type: Number, required: true },
    netAmount: { type: Number, required: true },
    status: { type: String, required: true, default: 'pending_manual_payout' },
    createdAt: { type: String, default: nowIso },
    updatedAt: { type: String, default: nowIso },
  },
  { versionKey: false },
);

const processedPaymentSchema = new mongoose.Schema(
  {
    paymentKey: { type: String, required: true, unique: true, index: true },
    requestId: { type: String, required: true },
    telegramId: { type: Number, required: true },
    amount: { type: Number, required: true },
    processedAt: { type: String, default: nowIso },
  },
  { versionKey: false },
);

const crashPresenceSchema = new mongoose.Schema(
  {
    telegramId: { type: Number, required: true, unique: true, index: true },
    wager: { type: Number, default: 0 },
    target: { type: Number, default: 1.5 },
    updatedAt: { type: Date, default: Date.now, index: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { versionKey: false },
);

const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
const DepositModel = mongoose.models.Deposit || mongoose.model('Deposit', depositSchema);
const WithdrawalModel = mongoose.models.Withdrawal || mongoose.model('Withdrawal', withdrawalSchema);
const ProcessedPaymentModel = mongoose.models.ProcessedPayment || mongoose.model('ProcessedPayment', processedPaymentSchema);
const CrashPresenceModel = mongoose.models.CrashPresence || mongoose.model('CrashPresence', crashPresenceSchema);

function getPublicConfig() {
  return {
    siteName: SITE_NAME,
    botUsername: BOT_USERNAME || undefined,
    adminGiftUsername: ADMIN_GIFT_USERNAME || undefined,
    depositMode: 'invoice',
    withdrawFeePercent: WITHDRAW_FEE_PERCENT,
  };
}

function buildDisplayName({ firstName, lastName, username }) {
  if (username) return `@${username}`;
  const name = [firstName, lastName].filter(Boolean).join(' ').trim();
  return name || 'Telegram User';
}

function sanitizeUserPayload(payload = {}) {
  const rawTelegramId = payload.telegramId
    ?? payload.telegram_id
    ?? payload.id
    ?? payload.userId
    ?? payload.user_id
    ?? payload.user?.id
    ?? 0;

  const telegramId = normalizeNumber(rawTelegramId, { min: 1, integerOnly: true, fallback: 0 });
  const firstName = String(payload.firstName || payload.first_name || payload.user?.first_name || '').trim() || 'Telegram';
  const lastName = String(payload.lastName || payload.last_name || payload.user?.last_name || '').trim() || undefined;
  const username = String(payload.username || payload.user?.username || '').trim().replace(/^@/, '') || undefined;
  const photoUrl = String(payload.photoUrl || payload.photo_url || payload.user?.photo_url || '').trim() || undefined;
  const languageCode = String(payload.languageCode || payload.language_code || payload.user?.language_code || '').trim() || undefined;

  return {
    telegramId,
    firstName,
    lastName,
    username,
    photoUrl,
    languageCode,
  };
}

function assertUserNotBlocked(user) {
  if (user?.blocked) {
    throw new Error('This account is blocked');
  }
}

function isAdmin(telegramId) {
  return ADMIN_TELEGRAM_IDS.has(normalizeNumber(telegramId, { min: 1, integerOnly: true, fallback: 0 }));
}

async function getUserByTelegramId(telegramId) {
  await ensureMongo();
  return UserModel.findOne({ telegramId }).lean();
}

async function upsertUserRecord(payload = {}) {
  await ensureMongo();
  const userPayload = sanitizeUserPayload(payload);
  if (!userPayload.telegramId) {
    throw new Error('Telegram user ID is invalid');
  }

  const existing = await UserModel.findOne({ telegramId: userPayload.telegramId }).lean();
  const update = {
    ...userPayload,
    displayName: buildDisplayName(userPayload),
    lastLoginAt: nowIso(),
    createdAt: existing?.createdAt || nowIso(),
    balance: normalizeNumber(existing?.balance || 0, { min: 0, precision: 2, fallback: 0 }),
    totalDeposited: normalizeNumber(existing?.totalDeposited || 0, { min: 0, precision: 2, fallback: 0 }),
    totalWithdrawn: normalizeNumber(existing?.totalWithdrawn || 0, { min: 0, precision: 2, fallback: 0 }),
    blocked: Boolean(existing?.blocked),
  };

  const user = await UserModel.findOneAndUpdate(
    { telegramId: userPayload.telegramId },
    { $set: update, $setOnInsert: { createdAt: update.createdAt } },
    { new: true, upsert: true, setDefaultsOnInsert: true, lean: true },
  );

  assertUserNotBlocked(user);
  return user;
}

async function setUserBalance(telegramId, balance) {
  await ensureMongo();
  const nextBalance = normalizeNumber(balance, { min: 0, precision: 2, fallback: 0 });
  const user = await UserModel.findOneAndUpdate(
    { telegramId },
    { $set: { balance: nextBalance } },
    { new: true, lean: true },
  );
  if (!user) throw new Error('User not found');
  assertUserNotBlocked(user);
  return user;
}

async function addUserBalance(telegramId, delta) {
  await ensureMongo();
  const user = await UserModel.findOne({ telegramId }).lean();
  if (!user) throw new Error('User not found');
  assertUserNotBlocked(user);
  const nextBalance = normalizeNumber((user.balance || 0) + delta, { min: 0, precision: 2, fallback: 0 });
  return setUserBalance(telegramId, nextBalance);
}

async function subtractUserBalance(telegramId, delta) {
  await ensureMongo();
  const user = await UserModel.findOne({ telegramId }).lean();
  if (!user) throw new Error('User not found');
  assertUserNotBlocked(user);
  const nextBalance = normalizeNumber((user.balance || 0) - delta, { min: 0, precision: 2, fallback: -1 });
  if (nextBalance < 0 || (user.balance || 0) < delta) {
    throw new Error('Not enough balance');
  }
  return setUserBalance(telegramId, nextBalance);
}

async function callTelegramApi(method, payload) {
  if (!BOT_TOKEN) return null;
  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.description || `Telegram API error: ${method}`);
  }
  return data.result;
}

async function answerCallbackQuery(callbackQueryId, text, showAlert = false) {
  if (!BOT_TOKEN || !callbackQueryId) return;
  try {
    await callTelegramApi('answerCallbackQuery', {
      callback_query_id: callbackQueryId,
      text,
      show_alert: showAlert,
    });
  } catch (error) {
    console.error('answerCallbackQuery error:', error.message);
  }
}

async function sendOrEditTelegramMessage({ chatId, messageId, text, replyMarkup }) {
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: replyMarkup,
  };

  if (messageId) {
    try {
      return await callTelegramApi('editMessageText', {
        ...payload,
        message_id: messageId,
      });
    } catch (error) {
      if (!String(error.message || '').toLowerCase().includes('message is not modified')) {
        console.error('editMessageText fallback:', error.message);
      }
    }
  }

  return callTelegramApi('sendMessage', payload);
}

function formatAdminUserLabel(user) {
  const status = user.blocked ? '⛔' : '✅';
  const name = escapeHtml(user.displayName || user.firstName || `User ${user.telegramId}`);
  const shortName = name.length > 24 ? `${name.slice(0, 21)}...` : name;
  return `${status} ${shortName} • ${normalizeNumber(user.balance || 0, { min: 0, fallback: 0 })}⭐`;
}

async function renderAdminHome(chatId, messageId) {
  await ensureMongo();
  const [usersCount, blockedCount, depositsCount, withdrawalsCount] = await Promise.all([
    UserModel.countDocuments({}),
    UserModel.countDocuments({ blocked: true }),
    DepositModel.countDocuments({}),
    WithdrawalModel.countDocuments({}),
  ]);

  return sendOrEditTelegramMessage({
    chatId,
    messageId,
    text: [
      `<b>${escapeHtml(SITE_NAME)} admin panel</b>`,
      `Users: <b>${usersCount}</b>`,
      `Blocked: <b>${blockedCount}</b>`,
      `Deposits: <b>${depositsCount}</b>`,
      `Withdrawals: <b>${withdrawalsCount}</b>`,
      '',
      'Use the buttons below to browse users and manage balances.',
    ].join('\n'),
    replyMarkup: {
      inline_keyboard: [
        [{ text: '👥 Users', callback_data: 'adm:users:0' }],
        [{ text: '🔄 Refresh', callback_data: 'adm:home' }],
      ],
    },
  });
}

async function renderAdminUsers(chatId, messageId, page = 0) {
  await ensureMongo();
  const totalUsers = await UserModel.countDocuments({});
  const totalPages = Math.max(1, Math.ceil(totalUsers / ADMIN_USERS_PAGE_SIZE));
  const safePage = Math.max(0, Math.min(page, totalPages - 1));
  const users = await UserModel.find({})
    .sort({ lastLoginAt: -1, createdAt: -1 })
    .skip(safePage * ADMIN_USERS_PAGE_SIZE)
    .limit(ADMIN_USERS_PAGE_SIZE)
    .lean();

  const rows = users.map((user) => ([{ text: formatAdminUserLabel(user), callback_data: `adm:user:${user.telegramId}` }]));
  const nav = [];
  if (safePage > 0) nav.push({ text: '⬅️ Prev', callback_data: `adm:users:${safePage - 1}` });
  if (safePage < totalPages - 1) nav.push({ text: 'Next ➡️', callback_data: `adm:users:${safePage + 1}` });
  if (nav.length) rows.push(nav);
  rows.push([{ text: '🏠 Home', callback_data: 'adm:home' }]);

  return sendOrEditTelegramMessage({
    chatId,
    messageId,
    text: `<b>User list</b>\nPage ${safePage + 1}/${totalPages}\n\nSelect a user to manage balances or block status.`,
    replyMarkup: { inline_keyboard: rows },
  });
}

async function renderAdminUserActions(chatId, messageId, telegramId) {
  await ensureMongo();
  const user = await UserModel.findOne({ telegramId }).lean();
  if (!user) throw new Error('User not found');

  const keyboard = [
    [
      { text: user.blocked ? '✅ Unblock' : '⛔ Block', callback_data: user.blocked ? `adm:unblock:${telegramId}` : `adm:block:${telegramId}` },
      { text: '🔄 Refresh', callback_data: `adm:user:${telegramId}` },
    ],
    [
      { text: '+10', callback_data: `adm:add:${telegramId}:10` },
      { text: '+50', callback_data: `adm:add:${telegramId}:50` },
      { text: '+100', callback_data: `adm:add:${telegramId}:100` },
    ],
    [
      { text: '-10', callback_data: `adm:sub:${telegramId}:10` },
      { text: '-50', callback_data: `adm:sub:${telegramId}:50` },
      { text: '-100', callback_data: `adm:sub:${telegramId}:100` },
    ],
    [
      { text: 'Set 0', callback_data: `adm:set:${telegramId}:0` },
      { text: 'Set 100', callback_data: `adm:set:${telegramId}:100` },
      { text: 'Set 1000', callback_data: `adm:set:${telegramId}:1000` },
    ],
    [{ text: '⬅️ Back to users', callback_data: 'adm:users:0' }],
  ];

  const username = user.username ? `@${escapeHtml(user.username)}` : '—';
  const status = user.blocked ? 'Blocked' : 'Active';

  return sendOrEditTelegramMessage({
    chatId,
    messageId,
    text: [
      '<b>User management</b>',
      `Name: <b>${escapeHtml(user.displayName || user.firstName || 'Telegram User')}</b>`,
      `Username: <b>${username}</b>`,
      `Telegram ID: <code>${user.telegramId}</code>`,
      `Balance: <b>${Number(user.balance || 0).toFixed(2)} ⭐</b>`,
      `Status: <b>${status}</b>`,
      `Total deposited: <b>${Number(user.totalDeposited || 0).toFixed(2)} ⭐</b>`,
      `Total withdrawn: <b>${Number(user.totalWithdrawn || 0).toFixed(2)} ⭐</b>`,
    ].join('\n'),
    replyMarkup: { inline_keyboard: keyboard },
  });
}

async function handleAdminCallback(callbackQuery) {
  const fromId = normalizeNumber(callbackQuery?.from?.id, { min: 1, integerOnly: true, fallback: 0 });
  const data = String(callbackQuery?.data || '');
  if (!data.startsWith('adm:')) return false;

  if (!isAdmin(fromId)) {
    await answerCallbackQuery(callbackQuery.id, 'Access denied', true);
    return true;
  }

  const chatId = callbackQuery.message?.chat?.id;
  const messageId = callbackQuery.message?.message_id;

  try {
    const [_, action, valueA = '', valueB = ''] = data.split(':');

    if (action === 'home') {
      await renderAdminHome(chatId, messageId);
      await answerCallbackQuery(callbackQuery.id, 'Updated');
      return true;
    }

    if (action === 'users') {
      await renderAdminUsers(chatId, messageId, normalizeNumber(valueA, { min: 0, integerOnly: true, fallback: 0 }));
      await answerCallbackQuery(callbackQuery.id, 'Updated');
      return true;
    }

    if (action === 'user') {
      await renderAdminUserActions(chatId, messageId, normalizeNumber(valueA, { min: 1, integerOnly: true, fallback: 0 }));
      await answerCallbackQuery(callbackQuery.id, 'Updated');
      return true;
    }

    const telegramId = normalizeNumber(valueA, { min: 1, integerOnly: true, fallback: 0 });
    const amount = normalizeNumber(valueB, { min: 0, precision: 2, fallback: 0 });
    if (!telegramId) {
      await answerCallbackQuery(callbackQuery.id, 'User not found', true);
      return true;
    }

    if (action === 'block' || action === 'unblock') {
      await ensureMongo();
      await UserModel.updateOne({ telegramId }, { $set: { blocked: action === 'block' } });
      await renderAdminUserActions(chatId, messageId, telegramId);
      await answerCallbackQuery(callbackQuery.id, action === 'block' ? 'User blocked' : 'User unblocked');
      return true;
    }

    if (action === 'add') {
      await addUserBalance(telegramId, amount);
      await renderAdminUserActions(chatId, messageId, telegramId);
      await answerCallbackQuery(callbackQuery.id, `+${amount} ⭐ added`);
      return true;
    }

    if (action === 'sub') {
      await subtractUserBalance(telegramId, amount);
      await renderAdminUserActions(chatId, messageId, telegramId);
      await answerCallbackQuery(callbackQuery.id, `-${amount} ⭐ removed`);
      return true;
    }

    if (action === 'set') {
      await setUserBalance(telegramId, amount);
      await renderAdminUserActions(chatId, messageId, telegramId);
      await answerCallbackQuery(callbackQuery.id, `Balance set to ${amount} ⭐`);
      return true;
    }

    await answerCallbackQuery(callbackQuery.id, 'Unknown action', true);
    return true;
  } catch (error) {
    console.error('admin callback error:', error);
    await answerCallbackQuery(callbackQuery.id, error.message || 'Admin action failed', true);
    return true;
  }
}

async function handleAdminCommand(message) {
  const text = String(message?.text || '').trim();
  if (!/^\/adm(?:@\w+)?$/i.test(text)) {
    return false;
  }

  const telegramId = normalizeNumber(message?.from?.id, { min: 1, integerOnly: true, fallback: 0 });
  const chatId = message?.chat?.id;
  if (!chatId) return true;

  if (!isAdmin(telegramId)) {
    await sendOrEditTelegramMessage({
      chatId,
      text: '<b>Access denied</b>\nYou are not allowed to open the admin panel.',
      replyMarkup: { inline_keyboard: [] },
    });
    return true;
  }

  await renderAdminHome(chatId);
  return true;
}

function parseTelegramInitData(initData) {
  const params = new URLSearchParams(initData || '');
  const hash = params.get('hash');
  if (!hash) throw new Error('Telegram hash was not found');

  params.delete('hash');
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const expectedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  const left = Buffer.from(expectedHash, 'hex');
  const right = Buffer.from(hash, 'hex');
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
    throw new Error('Telegram initData could not be verified');
  }

  const authDate = normalizeNumber(params.get('auth_date'), { min: 0, integerOnly: true, fallback: 0 });
  const now = Math.floor(Date.now() / 1000);
  if (authDate && Math.abs(now - authDate) > MINIAPP_AUTH_TTL_SECONDS) {
    throw new Error('Telegram session expired');
  }

  const userRaw = params.get('user');
  if (!userRaw) throw new Error('Telegram user data was not found');
  return JSON.parse(userRaw);
}

function buildDepositTitle() {
  return `${SITE_NAME} balance top-up`;
}

function buildDepositDescription(amount) {
  return `${amount} Telegram Stars will be added to your balance.`;
}

async function createTelegramInvoiceLink({ title, description, payload, amount }) {
  if (!BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured');
  }

  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      description,
      payload,
      currency: 'XTR',
      prices: [{ label: title, amount }],
    }),
  });

  const data = await response.json();
  if (!data.ok || !data.result) {
    throw new Error(data.description || 'Telegram invoice could not be created');
  }

  return data.result;
}

async function createDepositRequest({ telegramId, amount, title, description }) {
  await ensureMongo();
  const safeTelegramId = normalizeNumber(telegramId, { min: 1, integerOnly: true, fallback: 0 });
  const safeAmount = normalizeNumber(amount, { min: 1, integerOnly: true, fallback: 0 });

  if (!safeTelegramId) throw new Error('Telegram ID is invalid');
  if (!safeAmount) throw new Error('Stars amount must be at least 1');

  const user = await UserModel.findOne({ telegramId: safeTelegramId }).lean();
  if (!user) throw new Error('User not found');
  assertUserNotBlocked(user);

  const requestId = crypto.randomUUID();
  const payload = `deposit:${safeTelegramId}:${requestId}:${safeAmount}`;
  const invoiceLink = await createTelegramInvoiceLink({
    title: title || buildDepositTitle(),
    description: description || buildDepositDescription(safeAmount),
    payload,
    amount: safeAmount,
  });

  await DepositModel.create({
    id: requestId,
    telegramId: safeTelegramId,
    amount: safeAmount,
    title: title || buildDepositTitle(),
    description: description || buildDepositDescription(safeAmount),
    payload,
    invoiceLink,
    status: 'pending',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });

  return {
    ok: true,
    mode: 'invoice',
    requestId,
    invoiceLink,
    amount: safeAmount,
    botUsername: BOT_USERNAME || undefined,
  };
}

async function cleanupCrashPresence() {
  await ensureMongo();
  await CrashPresenceModel.deleteMany({ updatedAt: { $lt: new Date(Date.now() - CRASH_PRESENCE_TTL_MS) } });
}

app.post('/api/auth/telegram', async (req, res) => {
  try {
    if (!BOT_TOKEN) {
      return res.status(500).json({ error: 'Telegram bot token is not configured on the server' });
    }

    const { initData } = req.body || {};
    if (!initData) {
      return res.status(400).json({ error: 'initData is required' });
    }

    const telegramUser = parseTelegramInitData(initData);
    const user = await upsertUserRecord(telegramUser);
    res.json({ user, config: getPublicConfig() });
  } catch (error) {
    console.error('auth/telegram error:', error);
    res.status(400).json({ error: error.message || 'Telegram sign-in failed' });
  }
});

app.post('/api/auth/dev', async (req, res) => {
  try {
    if (!ALLOW_DEV_AUTH) {
      return res.status(403).json({ error: 'Dev auth is disabled in production' });
    }

    const user = await upsertUserRecord(req.body || {});
    res.json({ user, config: getPublicConfig() });
  } catch (error) {
    console.error('auth/dev error:', error);
    res.status(400).json({ error: error.message || 'Dev sign-in failed' });
  }
});

app.post('/api/auth/miniapp', async (req, res) => {
  try {
    const initData = String(req.body?.initData || '');
    const unsafeUser = req.body?.user || {};

    if (initData) {
      try {
        const strictUser = parseTelegramInitData(initData);
        const user = await upsertUserRecord(strictUser);
        return res.json({ user, config: getPublicConfig() });
      } catch (error) {
        console.warn('auth/miniapp strict verification failed:', error.message);
      }
    }

    const fallbackUser = sanitizeUserPayload({
      telegramId: unsafeUser.id || unsafeUser.telegramId,
      firstName: unsafeUser.first_name || unsafeUser.firstName,
      lastName: unsafeUser.last_name || unsafeUser.lastName,
      username: unsafeUser.username,
      photoUrl: unsafeUser.photo_url || unsafeUser.photoUrl,
      languageCode: unsafeUser.language_code || unsafeUser.languageCode,
    });

    if (!fallbackUser.telegramId) {
      return res.status(400).json({ error: 'Telegram account data could not be read' });
    }

    const user = await upsertUserRecord(fallbackUser);
    res.json({ user, config: getPublicConfig(), fallbackAuth: true });
  } catch (error) {
    console.error('auth/miniapp error:', error);
    res.status(400).json({ error: error.message || 'Mini App sign-in failed' });
  }
});

app.get('/api/users/:telegramId', async (req, res) => {
  try {
    const telegramId = normalizeNumber(req.params.telegramId, { min: 1, integerOnly: true, fallback: 0 });
    const user = await getUserByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    assertUserNotBlocked(user);
    res.json({ user, config: getPublicConfig() });
  } catch (error) {
    console.error('users/:telegramId error:', error);
    res.status(500).json({ error: error.message || 'User could not be loaded' });
  }
});

app.post('/api/balance/sync', async (req, res) => {
  try {
    const telegramId = normalizeNumber(req.body?.telegramId, { min: 1, integerOnly: true, fallback: 0 });
    const balance = normalizeNumber(req.body?.balance, { min: 0, precision: 2, fallback: -1 });

    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is invalid' });
    }
    if (balance < 0) {
      return res.status(400).json({ error: 'Balance is invalid' });
    }

    const user = await setUserBalance(telegramId, balance);
    res.json({ ok: true, user });
  } catch (error) {
    console.error('balance/sync error:', error);
    res.status(400).json({ error: error.message || 'Balance could not be synced' });
  }
});

app.post('/api/deposits/request', async (req, res) => {
  try {
    const response = await createDepositRequest(req.body || {});
    res.json(response);
  } catch (error) {
    console.error('deposits/request error:', error);
    res.status(400).json({ error: error.message || 'Deposit could not be created' });
  }
});

app.post('/api/stars/create-invoice', async (req, res) => {
  try {
    const response = await createDepositRequest({
      telegramId: req.body?.telegramId || req.body?.userId,
      amount: req.body?.amount,
      title: req.body?.title,
      description: req.body?.description,
    });
    res.json(response);
  } catch (error) {
    console.error('stars/create-invoice error:', error);
    res.status(400).json({ error: error.message || 'Invoice could not be created' });
  }
});

app.post('/api/withdrawals/request', async (req, res) => {
  try {
    await ensureMongo();
    const telegramId = normalizeNumber(req.body?.telegramId, { min: 1, integerOnly: true, fallback: 0 });
    const amount = normalizeNumber(req.body?.amount, { min: 0.01, precision: 2, fallback: 0 });

    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is invalid' });
    }
    if (!amount) {
      return res.status(400).json({ error: 'Withdraw amount is invalid' });
    }

    const feeAmount = normalizeNumber((amount * WITHDRAW_FEE_PERCENT) / 100, { min: 0, precision: 2, fallback: 0 });
    const netAmount = normalizeNumber(amount - feeAmount, { min: 0.01, precision: 2, fallback: 0 });
    if (netAmount <= 0) {
      return res.status(400).json({ error: 'Withdraw amount must remain above 0 after fees' });
    }

    const currentUser = await UserModel.findOne({ telegramId }).lean();
    if (!currentUser) throw new Error('User not found');
    assertUserNotBlocked(currentUser);
    if ((currentUser.balance || 0) < amount) {
      throw new Error('Not enough balance');
    }

    const user = await UserModel.findOneAndUpdate(
      { telegramId },
      {
        $set: { balance: normalizeNumber((currentUser.balance || 0) - amount, { min: 0, precision: 2, fallback: 0 }) },
        $inc: { totalWithdrawn: netAmount },
      },
      { new: true, lean: true },
    );

    if (!user) {
      throw new Error('User not found');
    }

    const requestId = crypto.randomUUID();
    await WithdrawalModel.create({
      id: requestId,
      telegramId,
      amount,
      feeAmount,
      netAmount,
      status: 'pending_manual_payout',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });

    res.json({
      ok: true,
      requestId,
      amount,
      feeAmount,
      netAmount,
      status: 'pending_manual_payout',
      user,
    });
  } catch (error) {
    console.error('withdrawals/request error:', error);
    res.status(400).json({ error: error.message || 'Withdraw request could not be created' });
  }
});

app.get('/api/crash/live', async (req, res) => {
  try {
    await cleanupCrashPresence();
    const queuedBettors = await CrashPresenceModel.countDocuments({});
    res.json({ ok: true, queuedBettors, updatedAt: nowIso() });
  } catch (error) {
    console.error('crash/live error:', error);
    res.status(500).json({ error: error.message || 'Crash live count could not be loaded' });
  }
});

app.post('/api/crash/presence', async (req, res) => {
  try {
    await cleanupCrashPresence();
    const telegramId = normalizeNumber(req.body?.telegramId, { min: 1, integerOnly: true, fallback: 0 });
    const active = Boolean(req.body?.active);
    const wager = normalizeNumber(req.body?.wager, { min: 0, precision: 2, fallback: 0 });
    const target = normalizeNumber(req.body?.target, { min: 1.25, precision: 2, fallback: 1.5 });

    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is invalid' });
    }

    if (!active) {
      await CrashPresenceModel.deleteOne({ telegramId });
      const queuedBettors = await CrashPresenceModel.countDocuments({});
      return res.json({ ok: true, queuedBettors });
    }

    const expiresAt = new Date(Date.now() + CRASH_PRESENCE_TTL_MS);
    await CrashPresenceModel.findOneAndUpdate(
      { telegramId },
      { $set: { telegramId, wager, target, updatedAt: new Date(), expiresAt } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    const queuedBettors = await CrashPresenceModel.countDocuments({});
    res.json({ ok: true, queuedBettors });
  } catch (error) {
    console.error('crash/presence error:', error);
    res.status(500).json({ error: error.message || 'Crash presence could not be updated' });
  }
});

app.post('/api/telegram/webhook', async (req, res) => {
  try {
    const update = req.body || {};

    if (update.callback_query) {
      const handled = await handleAdminCallback(update.callback_query);
      if (handled) {
        return res.json({ ok: true });
      }
    }

    if (update.message?.text) {
      const handled = await handleAdminCommand(update.message);
      if (handled) {
        return res.json({ ok: true });
      }
    }

    if (update.pre_checkout_query) {
      await ensureMongo();
      const pcq = update.pre_checkout_query;
      const payload = String(pcq.invoice_payload || '');
      const [type, telegramIdRaw, requestId, amountRaw] = payload.split(':');
      const expectedTelegramId = normalizeNumber(telegramIdRaw, { min: 1, integerOnly: true, fallback: 0 });
      const expectedAmount = normalizeNumber(amountRaw, { min: 1, integerOnly: true, fallback: 0 });
      let ok = type === 'deposit' && Boolean(requestId) && Boolean(expectedTelegramId) && Boolean(expectedAmount);
      let errorMessage;

      if (ok) {
        const requestDoc = await DepositModel.findOne({ id: requestId }).lean();
        ok = Boolean(
          requestDoc
          && requestDoc.status === 'pending'
          && requestDoc.telegramId === expectedTelegramId
          && requestDoc.amount === expectedAmount
        );
        if (!ok) {
          errorMessage = 'Deposit request is invalid';
        }
      }

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerPreCheckoutQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pre_checkout_query_id: pcq.id,
          ok,
          ...(ok ? {} : { error_message: errorMessage || 'Request was not approved' }),
        }),
      });
    }

    if (update.message?.successful_payment) {
      await ensureMongo();
      const payment = update.message.successful_payment;
      const payload = String(payment.invoice_payload || '');
      const [type, telegramIdRaw, requestId, amountRaw] = payload.split(':');
      const telegramId = normalizeNumber(telegramIdRaw, { min: 1, integerOnly: true, fallback: 0 });
      const expectedAmount = normalizeNumber(amountRaw, { min: 1, integerOnly: true, fallback: 0 });
      const paidAmount = normalizeNumber(payment.total_amount, { min: 1, integerOnly: true, fallback: 0 });
      const paymentKey = payment.telegram_payment_charge_id || payment.provider_payment_charge_id;

      if (type === 'deposit' && requestId && telegramId && paidAmount) {
        if (paymentKey) {
          const alreadyProcessed = await ProcessedPaymentModel.findOne({ paymentKey }).lean();
          if (alreadyProcessed) {
            return res.json({ ok: true });
          }
        }

        const requestDoc = await DepositModel.findOne({ id: requestId }).lean();
        if (requestDoc && requestDoc.status !== 'paid') {
          const amountToCredit = expectedAmount || paidAmount;
          await addUserBalance(telegramId, amountToCredit);
          await UserModel.updateOne(
            { telegramId },
            { $inc: { totalDeposited: amountToCredit } },
          );
          await DepositModel.updateOne(
            { id: requestId },
            {
              $set: {
                status: 'paid',
                paidAt: nowIso(),
                updatedAt: nowIso(),
                telegramPaymentChargeId: payment.telegram_payment_charge_id,
                providerPaymentChargeId: payment.provider_payment_charge_id,
                paidAmount,
              },
            },
          );

          if (paymentKey) {
            await ProcessedPaymentModel.create({
              paymentKey,
              requestId,
              telegramId,
              amount: paidAmount,
              processedAt: nowIso(),
            });
          }
        }
      }
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('telegram/webhook error:', error);
    res.json({ ok: true });
  }
});

app.post('/api/stars/refund', async (req, res) => {
  try {
    const userId = normalizeNumber(req.body?.userId, { min: 1, integerOnly: true, fallback: 0 });
    const telegramPaymentChargeId = String(req.body?.telegramPaymentChargeId || '').trim();

    if (!userId || !telegramPaymentChargeId) {
      return res.status(400).json({ error: 'userId and telegramPaymentChargeId are required' });
    }
    if (!BOT_TOKEN) {
      return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN is not configured' });
    }

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/refundStarPayment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        telegram_payment_charge_id: telegramPaymentChargeId,
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('stars/refund error:', error);
    res.status(500).json({ error: error.message || 'Refund could not be processed' });
  }
});

app.get('/api/health', async (req, res) => {
  await ensureMongo();
  const [usersCount, depositsCount, withdrawalsCount] = await Promise.all([
    UserModel.countDocuments({}),
    DepositModel.countDocuments({}),
    WithdrawalModel.countDocuments({}),
  ]);

  res.json({
    status: 'ok',
    timestamp: nowIso(),
    botConfigured: Boolean(BOT_TOKEN),
    storage: 'mongodb',
    mongoState: mongoose.connection.readyState,
    counters: {
      users: usersCount,
      deposits: depositsCount,
      withdrawals: withdrawalsCount,
    },
    config: getPublicConfig(),
  });
});

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (error) => {
    if (error) {
      console.error('index.html missing:', error.message);
      res.status(404).send('App is not built. Run npm run build first.');
    }
  });
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🗃️ MongoDB: ${MONGODB_URI}`);

  try {
    await ensureMongo();
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }

  if (BOT_TOKEN && process.env.RENDER_EXTERNAL_URL) {
    const webhookUrl = `${process.env.RENDER_EXTERNAL_URL}/api/telegram/webhook`;
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl, drop_pending_updates: true }),
    })
      .then((response) => response.json())
      .then((data) => console.log('Webhook set:', data.ok ? '✅' : '❌', data.description || ''))
      .catch((error) => console.error('Webhook set error:', error.message));
  }
});
