// /api/bot -> redirects to the bot's t.me link (username is read from Telegram, so it is not hard-coded).
const { api } = require('../lib/tg');
let cached;
exports.handler = async () => {
  if (!cached) { const r = await api('getMe'); if (r.ok && r.result.username) cached = `https://t.me/${r.result.username}`; }
  return { statusCode: 302, headers: { Location: cached || '/#contact', 'Cache-Control': 'no-store' }, body: '' };
};
