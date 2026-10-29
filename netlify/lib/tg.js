const crypto = require('crypto');
const token = () => process.env.TELEGRAM_BOT_TOKEN || '';
const owner = () => String(process.env.TELEGRAM_CHAT_ID || '');
// Secret the Telegram webhook must send back; derived from the token, so no extra setting is needed.
const secret = () => crypto.createHash('sha256').update(token()).digest('hex').slice(0, 32);
const api = async (method, body) => {
  try {
    const r = await fetch(`https://api.telegram.org/bot${token()}/${method}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {})
    });
    return await r.json();
  } catch { return { ok: false }; }
};
const json = (code, obj) => ({ statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) });
module.exports = { token, owner, secret, api, json, configured: () => !!token() && !!owner() };
