require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ── Telegram Stars ödəniş ──────────────────────────────────────────────
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// Telegram Stars invoice yaratmaq
app.post('/api/stars/create-invoice', async (req, res) => {
  try {
    const { title, description, payload, amount, userId } = req.body;

    if (!title || !amount || !payload) {
      return res.status(400).json({ error: 'title, amount, payload lazımdır' });
    }

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title,
        description: description || title,
        payload: payload,
        currency: 'XTR', // Telegram Stars
        prices: [{ label: title, amount: amount }], // amount = stars sayı
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('Telegram invoice error:', data);
      return res.status(500).json({ error: data.description });
    }

    res.json({ invoiceLink: data.result, ok: true });
  } catch (err) {
    console.error('create-invoice error:', err);
    res.status(500).json({ error: 'Server xətası' });
  }
});

// Telegram webhook - Stars ödənişini qəbul et
app.post('/api/telegram/webhook', async (req, res) => {
  try {
    const update = req.body;

    // Pre-checkout query - mütləq cavab verilməlidir
    if (update.pre_checkout_query) {
      const pcq = update.pre_checkout_query;
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerPreCheckoutQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pre_checkout_query_id: pcq.id,
          ok: true,
        }),
      });
      console.log('Pre-checkout approved for:', pcq.invoice_payload);
    }

    // Uğurlu ödəniş
    if (update.message && update.message.successful_payment) {
      const payment = update.message.successful_payment;
      const payload = payment.invoice_payload;
      const stars = payment.total_amount;
      const userId = update.message.from.id;

      console.log(`✅ Stars ödənişi alındı: ${stars} XTR, payload: ${payload}, userId: ${userId}`);

      // Burada öz biznes logikinizi əlavə edin:
      // - DB-də balansı artırın
      // - oyun kreditlərini verin
      // payload-dan nə aldığını parse edin

      // Nümunə: payload = "topup_500" → 500 kredit ver
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.json({ ok: true }); // Telegram-a həmişə 200 qaytar
  }
});

// Telegram Stars refund (lazım olsa)
app.post('/api/stars/refund', async (req, res) => {
  try {
    const { userId, telegramPaymentChargeId } = req.body;

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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Static fayllar - Vite build output ────────────────────────────────
// vite.config.ts-də outDir təyin edilməyibsə default 'dist' olur
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback - bütün route-ları index.html-ə yönləndir
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('index.html tapılmadı:', err.message);
      res.status(404).send(
        'App henüz build edilməyib. "npm run build" komandını işlədin.'
      );
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server ${PORT} portunda işləyir`);

  // Telegram webhook quraşdır
  if (BOT_TOKEN && process.env.RENDER_EXTERNAL_URL) {
    const webhookUrl = `${process.env.RENDER_EXTERNAL_URL}/api/telegram/webhook`;
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl, drop_pending_updates: true }),
    })
      .then((r) => r.json())
      .then((d) => console.log('Webhook set:', d.ok ? '✅' : '❌', d.description || ''))
      .catch((e) => console.error('Webhook set error:', e.message));
  }
});
