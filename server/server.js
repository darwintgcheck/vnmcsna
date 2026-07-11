require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
const STORE_FILE = process.env.STORE_FILE || path.join(__dirname, 'data', 'db.json');
const SITE_NAME = process.env.SITE_NAME || 'Venom Kazino';
const BOT_USERNAME = (process.env.TELEGRAM_BOT_USERNAME || '').replace(/^@/, '');
const ADMIN_GIFT_USERNAME = (process.env.ADMIN_GIFT_USERNAME || '').replace(/^@/, '');
const WITHDRAW_FEE_PERCENT = normalizeNumber(process.env.WITHDRAW_FEE_PERCENT || 8, { min: 0, max: 100, fallback: 8 });

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

function nowIso() {
  return new Date().toISOString();
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
  const rounded = integerOnly
    ? Math.trunc(raw)
    : Number(raw.toFixed(precision));

  if (rounded < min || rounded > max) return fallback;
  return rounded;
}

function createEmptyDb() {
  return {
    users: {},
    deposits: {},
    withdrawals: {},
    processedPayments: {},
    meta: {
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  };
}

async function ensureStoreFile() {
  await fsp.mkdir(path.dirname(STORE_FILE), { recursive: true });
  try {
    await fsp.access(STORE_FILE, fs.constants.F_OK);
  } catch {
    await fsp.writeFile(STORE_FILE, JSON.stringify(createEmptyDb(), null, 2), 'utf8');
  }
}

async function readDb() {
  await ensureStoreFile();
  try {
    const raw = await fsp.readFile(STORE_FILE, 'utf8');
    const parsed = raw ? JSON.parse(raw) : createEmptyDb();
    return {
      ...createEmptyDb(),
      ...parsed,
      users: parsed.users || {},
      deposits: parsed.deposits || {},
      withdrawals: parsed.withdrawals || {},
      processedPayments: parsed.processedPayments || {},
      meta: {
        ...createEmptyDb().meta,
        ...(parsed.meta || {}),
      },
    };
  } catch (error) {
    console.error('DB read error, resetting store:', error.message);
    const emptyDb = createEmptyDb();
    await writeDb(emptyDb);
    return emptyDb;
  }
}

let writeQueue = Promise.resolve();

async function writeDb(db) {
  db.meta = {
    ...(db.meta || {}),
    updatedAt: nowIso(),
  };
  await ensureStoreFile();
  const tempFile = `${STORE_FILE}.tmp`;
  await fsp.writeFile(tempFile, JSON.stringify(db, null, 2), 'utf8');
  await fsp.rename(tempFile, STORE_FILE);
}

function withDb(mutator) {
  writeQueue = writeQueue.then(async () => {
    const db = await readDb();
    const result = await mutator(db);
    await writeDb(db);
    return result;
  });
  return writeQueue;
}

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

function upsertUserRecord(db, payload = {}) {
  const userPayload = sanitizeUserPayload(payload);
  if (!userPayload.telegramId) {
    throw new Error('Telegram istifadəçi ID-si yanlışdır');
  }

  const key = String(userPayload.telegramId);
  const existing = db.users[key] || {
    telegramId: userPayload.telegramId,
    balance: 0,
    totalDeposited: 0,
    totalWithdrawn: 0,
    createdAt: nowIso(),
  };

  const nextUser = {
    ...existing,
    ...userPayload,
    displayName: buildDisplayName(userPayload),
    lastLoginAt: nowIso(),
  };

  db.users[key] = nextUser;
  return nextUser;
}

function setUserBalance(db, telegramId, balance) {
  const key = String(telegramId);
  const user = db.users[key];
  if (!user) throw new Error('İstifadəçi tapılmadı');

  user.balance = normalizeNumber(balance, { min: 0, precision: 2, fallback: 0 });
  db.users[key] = user;
  return user;
}

function addUserBalance(db, telegramId, delta) {
  const key = String(telegramId);
  const user = db.users[key];
  if (!user) throw new Error('İstifadəçi tapılmadı');

  user.balance = normalizeNumber((user.balance || 0) + delta, { min: 0, precision: 2, fallback: 0 });
  db.users[key] = user;
  return user;
}

function subtractUserBalance(db, telegramId, delta) {
  const key = String(telegramId);
  const user = db.users[key];
  if (!user) throw new Error('İstifadəçi tapılmadı');
  const nextBalance = normalizeNumber((user.balance || 0) - delta, { min: 0, precision: 2, fallback: -1 });
  if (nextBalance < 0 || (user.balance || 0) < delta) {
    throw new Error('Balans kifayət etmir');
  }
  user.balance = nextBalance;
  db.users[key] = user;
  return user;
}

function parseTelegramInitData(initData) {
  const params = new URLSearchParams(initData || '');
  const hash = params.get('hash');
  if (!hash) {
    throw new Error('Telegram hash tapılmadı');
  }

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
    throw new Error('Telegram initData doğrulanmadı');
  }

  const authDate = normalizeNumber(params.get('auth_date'), { min: 0, integerOnly: true, fallback: 0 });
  const now = Math.floor(Date.now() / 1000);
  if (authDate && Math.abs(now - authDate) > 60 * 60 * 24) {
    throw new Error('Telegram sessiyası köhnəlib');
  }

  const userRaw = params.get('user');
  if (!userRaw) {
    throw new Error('Telegram user məlumatı tapılmadı');
  }

  return JSON.parse(userRaw);
}

function buildDepositTitle(amount) {
  return `${SITE_NAME} balans artırımı`;
}

function buildDepositDescription(amount) {
  return `${amount} Telegram Stars balansınıza əlavə olunacaq.`;
}

async function createTelegramInvoiceLink({ title, description, payload, amount }) {
  if (!BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN təyin olunmayıb');
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
    throw new Error(data.description || 'Telegram invoice yaradılmadı');
  }

  return data.result;
}

async function createDepositRequest({ telegramId, amount, title, description }) {
  const safeTelegramId = normalizeNumber(telegramId, { min: 1, integerOnly: true, fallback: 0 });
  const safeAmount = normalizeNumber(amount, { min: 1, integerOnly: true, fallback: 0 });

  if (!safeTelegramId) throw new Error('Telegram ID yanlışdır');
  if (!safeAmount) throw new Error('Stars məbləği ən az 1 olmalıdır');

  const requestId = crypto.randomUUID();
  const payload = `deposit:${safeTelegramId}:${requestId}:${safeAmount}`;
  const invoiceLink = await createTelegramInvoiceLink({
    title: title || buildDepositTitle(safeAmount),
    description: description || buildDepositDescription(safeAmount),
    payload,
    amount: safeAmount,
  });

  await withDb(async (db) => {
    const user = db.users[String(safeTelegramId)];
    if (!user) throw new Error('İstifadəçi tapılmadı');

    db.deposits[requestId] = {
      id: requestId,
      telegramId: safeTelegramId,
      amount: safeAmount,
      title: title || buildDepositTitle(safeAmount),
      description: description || buildDepositDescription(safeAmount),
      payload,
      invoiceLink,
      status: 'pending',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
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

app.post('/api/auth/telegram', async (req, res) => {
  try {
    if (!BOT_TOKEN) {
      return res.status(500).json({ error: 'Serverdə Telegram bot token qurulmayıb' });
    }

    const { initData } = req.body || {};
    if (!initData) {
      return res.status(400).json({ error: 'initData göndərilməlidir' });
    }

    const telegramUser = parseTelegramInitData(initData);
    const result = await withDb(async (db) => {
      const user = upsertUserRecord(db, telegramUser);
      return { user, config: getPublicConfig() };
    });

    res.json(result);
  } catch (error) {
    console.error('auth/telegram error:', error);
    res.status(400).json({ error: error.message || 'Telegram giriş xətası' });
  }
});

app.post('/api/auth/dev', async (req, res) => {
  try {
    const result = await withDb(async (db) => {
      const user = upsertUserRecord(db, req.body || {});
      return { user, config: getPublicConfig() };
    });

    res.json(result);
  } catch (error) {
    console.error('auth/dev error:', error);
    res.status(400).json({ error: error.message || 'Dev giriş xətası' });
  }
});

app.get('/api/users/:telegramId', async (req, res) => {
  try {
    const telegramId = normalizeNumber(req.params.telegramId, { min: 1, integerOnly: true, fallback: 0 });
    const db = await readDb();
    const user = db.users[String(telegramId)];

    if (!user) {
      return res.status(404).json({ error: 'İstifadəçi tapılmadı' });
    }

    res.json({ user, config: getPublicConfig() });
  } catch (error) {
    console.error('users/:telegramId error:', error);
    res.status(500).json({ error: 'İstifadəçi oxunmadı' });
  }
});

app.post('/api/balance/sync', async (req, res) => {
  try {
    const telegramId = normalizeNumber(req.body?.telegramId, { min: 1, integerOnly: true, fallback: 0 });
    const balance = normalizeNumber(req.body?.balance, { min: 0, precision: 2, fallback: -1 });

    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID yanlışdır' });
    }
    if (balance < 0) {
      return res.status(400).json({ error: 'Balans yanlışdır' });
    }

    const user = await withDb(async (db) => setUserBalance(db, telegramId, balance));
    res.json({ ok: true, user });
  } catch (error) {
    console.error('balance/sync error:', error);
    res.status(400).json({ error: error.message || 'Balans sinxronlaşmadı' });
  }
});

app.post('/api/deposits/request', async (req, res) => {
  try {
    const response = await createDepositRequest(req.body || {});
    res.json(response);
  } catch (error) {
    console.error('deposits/request error:', error);
    res.status(400).json({ error: error.message || 'Depozit yaradılmadı' });
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
    res.status(400).json({ error: error.message || 'Invoice yaradılmadı' });
  }
});

app.post('/api/withdrawals/request', async (req, res) => {
  try {
    const telegramId = normalizeNumber(req.body?.telegramId, { min: 1, integerOnly: true, fallback: 0 });
    const amount = normalizeNumber(req.body?.amount, { min: 0.01, precision: 2, fallback: 0 });

    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID yanlışdır' });
    }
    if (!amount) {
      return res.status(400).json({ error: 'Çıxarış məbləği yanlışdır' });
    }

    const feeAmount = normalizeNumber((amount * WITHDRAW_FEE_PERCENT) / 100, { min: 0, precision: 2, fallback: 0 });
    const netAmount = normalizeNumber(amount - feeAmount, { min: 0.01, precision: 2, fallback: 0 });

    if (netAmount <= 0) {
      return res.status(400).json({ error: 'Komissiyadan sonra çıxarış məbləği 0-dan böyük olmalıdır' });
    }

    const result = await withDb(async (db) => {
      const user = subtractUserBalance(db, telegramId, amount);
      user.totalWithdrawn = normalizeNumber((user.totalWithdrawn || 0) + netAmount, {
        min: 0,
        precision: 2,
        fallback: user.totalWithdrawn || 0,
      });
      db.users[String(telegramId)] = user;

      const requestId = crypto.randomUUID();
      db.withdrawals[requestId] = {
        id: requestId,
        telegramId,
        amount,
        feeAmount,
        netAmount,
        status: 'pending_manual_payout',
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };

      return {
        ok: true,
        requestId,
        amount,
        feeAmount,
        netAmount,
        status: 'pending_manual_payout',
        user,
      };
    });

    res.json(result);
  } catch (error) {
    console.error('withdrawals/request error:', error);
    res.status(400).json({ error: error.message || 'Çıxarış yaradılmadı' });
  }
});

app.post('/api/telegram/webhook', async (req, res) => {
  try {
    const update = req.body || {};

    if (update.pre_checkout_query) {
      const pcq = update.pre_checkout_query;
      const payload = String(pcq.invoice_payload || '');
      const [type, telegramIdRaw, requestId, amountRaw] = payload.split(':');
      const expectedTelegramId = normalizeNumber(telegramIdRaw, { min: 1, integerOnly: true, fallback: 0 });
      const expectedAmount = normalizeNumber(amountRaw, { min: 1, integerOnly: true, fallback: 0 });

      let ok = type === 'deposit' && Boolean(requestId) && Boolean(expectedTelegramId) && Boolean(expectedAmount);
      let errorMessage;

      if (ok) {
        const db = await readDb();
        const request = db.deposits[requestId];
        ok = Boolean(
          request &&
          request.status === 'pending' &&
          request.telegramId === expectedTelegramId &&
          request.amount === expectedAmount
        );
        if (!ok) {
          errorMessage = 'Depozit sorğusu etibarsızdır';
        }
      }

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerPreCheckoutQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pre_checkout_query_id: pcq.id,
          ok,
          ...(ok ? {} : { error_message: errorMessage || 'Sorğu təsdiqlənmədi' }),
        }),
      });
    }

    if (update.message?.successful_payment) {
      const payment = update.message.successful_payment;
      const payload = String(payment.invoice_payload || '');
      const [type, telegramIdRaw, requestId, amountRaw] = payload.split(':');
      const telegramId = normalizeNumber(telegramIdRaw, { min: 1, integerOnly: true, fallback: 0 });
      const expectedAmount = normalizeNumber(amountRaw, { min: 1, integerOnly: true, fallback: 0 });
      const paidAmount = normalizeNumber(payment.total_amount, { min: 1, integerOnly: true, fallback: 0 });
      const paymentKey = payment.telegram_payment_charge_id || payment.provider_payment_charge_id;

      if (type === 'deposit' && requestId && telegramId && paidAmount) {
        await withDb(async (db) => {
          if (paymentKey && db.processedPayments[paymentKey]) {
            return;
          }

          const request = db.deposits[requestId];
          if (!request || request.status === 'paid') {
            return;
          }

          const amountToCredit = expectedAmount || paidAmount;
          const user = addUserBalance(db, telegramId, amountToCredit);
          user.totalDeposited = normalizeNumber((user.totalDeposited || 0) + amountToCredit, {
            min: 0,
            precision: 2,
            fallback: user.totalDeposited || 0,
          });
          db.users[String(telegramId)] = user;

          request.status = 'paid';
          request.paidAt = nowIso();
          request.updatedAt = nowIso();
          request.telegramPaymentChargeId = payment.telegram_payment_charge_id;
          request.providerPaymentChargeId = payment.provider_payment_charge_id;
          request.paidAmount = paidAmount;
          db.deposits[requestId] = request;

          if (paymentKey) {
            db.processedPayments[paymentKey] = {
              requestId,
              telegramId,
              amount: paidAmount,
              processedAt: nowIso(),
            };
          }
        });
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
      return res.status(400).json({ error: 'userId və telegramPaymentChargeId lazımdır' });
    }
    if (!BOT_TOKEN) {
      return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN təyin olunmayıb' });
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
    res.status(500).json({ error: error.message || 'Refund mümkün olmadı' });
  }
});

app.get('/api/health', async (req, res) => {
  const db = await readDb();
  res.json({
    status: 'ok',
    timestamp: nowIso(),
    botConfigured: Boolean(BOT_TOKEN),
    storeFile: STORE_FILE,
    counters: {
      users: Object.keys(db.users || {}).length,
      deposits: Object.keys(db.deposits || {}).length,
      withdrawals: Object.keys(db.withdrawals || {}).length,
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
      console.error('index.html tapılmadı:', error.message);
      res.status(404).send('App build olunmayıb. npm run build işlədin.');
    }
  });
});

app.listen(PORT, '0.0.0.0', async () => {
  await ensureStoreFile();
  console.log(`🚀 Server ${PORT} portunda işləyir`);
  console.log(`💾 Store file: ${STORE_FILE}`);

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
