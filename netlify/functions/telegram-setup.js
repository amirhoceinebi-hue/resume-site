// Open /api/setup once in a browser after deploying: registers the webhook with Telegram.
const { secret, api, configured } = require('../lib/tg');
exports.handler = async () => {
  const text = (code, t) => ({ statusCode: code, headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: t });
  if (!configured()) return text(500, 'Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in Netlify, redeploy, then open this page again.');
  const base = (process.env.URL || '').replace(/\/$/, '');
  if (!base) return text(500, 'Site URL unknown.');
  const url = `${base}/.netlify/functions/telegram`;
  const r = await api('setWebhook', { url, secret_token: secret(), allowed_updates: ['message'], drop_pending_updates: true });
  return r.ok ? text(200, `OK - webhook set: ${url}`) : text(502, `Failed: ${r.description || 'unknown error'}`);
};
