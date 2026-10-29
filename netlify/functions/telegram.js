// Telegram webhook: welcome message, relay user -> you, and your replies -> user.
const { owner, secret, api, configured } = require('../lib/tg');
const WELCOME = 'سلام 👋\nبه ربات امیرحسین ابراهیمی خوش آمدید.\nپیام خود را همین‌جا بنویسید تا مستقیم به دست من برسد و در اولین فرصت پاسخ بدهم.\n\nHello! Welcome to Amirhossein Ebrahimi\'s bot. Send your message here and I\'ll reply as soon as I can.';
const OK = { statusCode: 200, body: 'ok' };
const hits = new Map();

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: '' };
  if (!configured()) return { statusCode: 500, body: '' };
  if ((event.headers['x-telegram-bot-api-secret-token'] || '') !== secret()) return { statusCode: 401, body: '' };
  let u; try { u = JSON.parse(event.body); } catch { return OK; }
  const m = u.message;
  if (!m || !m.from || !m.chat || m.chat.type !== 'private') return OK;
  const me = owner(), id = String(m.chat.id), text = (m.text || '').trim();

  if (id === me) { // you
    if (text === '/start') return await api('sendMessage', { chat_id: me, text: 'ربات فعال است ✅\nپیام کاربران اینجا می‌آید. برای پاسخ، روی پیام کاربر Reply بزنید و جواب را بنویسید.' }), OK;
    const rt = m.reply_to_message, tag = rt && String(rt.text || rt.caption || '').match(/^شناسه:\s*(\d+)/);
    if (!tag) { await api('sendMessage', { chat_id: me, text: 'برای پاسخ به یک کاربر، روی پیام او Reply بزنید و جواب را بنویسید.' }); return OK; }
    const r = await api('copyMessage', { chat_id: tag[1], from_chat_id: me, message_id: m.message_id });
    if (!r.ok) await api('sendMessage', { chat_id: me, text: '❌ ارسال نشد (احتمالاً کاربر ربات را مسدود کرده است).' });
    return OK;
  }

  if (text === '/start' || text.startsWith('/start ')) { await api('sendMessage', { chat_id: id, text: WELCOME }); return OK; }
  const now = Date.now(), list = (hits.get(id) || []).filter(t => now - t < 600000);
  if (list.length >= 20) return OK;
  list.push(now); hits.set(id, list);

  const name = [m.from.first_name, m.from.last_name].filter(Boolean).join(' ') || '-';
  const head = `شناسه: ${id}\nنام: ${name}${m.from.username ? ' (@' + m.from.username + ')' : ''}`;
  let r;
  if (m.text) r = await api('sendMessage', { chat_id: me, text: `${head}\n\n${m.text}`.slice(0, 4000) });
  else r = await api('copyMessage', { chat_id: me, from_chat_id: id, message_id: m.message_id, caption: (head + (m.caption ? '\n\n' + m.caption : '')).slice(0, 1024) });
  await api('sendMessage', { chat_id: id, text: r.ok ? '✅ پیام شما رسید. به‌زودی پاسخ می‌دهم.' : '⚠️ ارسال پیام انجام نشد. لطفاً دوباره تلاش کنید.' });
  return OK;
};
