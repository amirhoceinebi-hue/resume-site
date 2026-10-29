// Website contact form -> your Telegram account (via the bot).
const { owner, api, json, configured } = require('../lib/tg');
const hits = new Map();
const WINDOW = 10 * 60 * 1000, MAX = 3;
const clean = (s, n) => String(s || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok: false });
  const ip = event.headers['x-nf-client-connection-ip'] || (event.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < WINDOW);
  if (list.length >= MAX) return json(429, { ok: false, error: 'rate' });
  list.push(now); hits.set(ip, list);

  let b = {};
  try { b = JSON.parse(event.body || '{}'); } catch {}
  if (b.website) return json(200, { ok: true }); // honeypot
  const name = clean(b.name, 80), contact = clean(b.contact, 80);
  const message = String(b.message || '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, 2000);
  const phone = /^\+?[0-9\s\-()]{7,20}$/, handle = /^@?[A-Za-z0-9_.]{3,40}$/, mail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (name.length < 2 || message.length < 5 || !(phone.test(contact) || handle.test(contact) || mail.test(contact)))
    return json(400, { ok: false, error: 'invalid' });
  if (!configured()) return json(500, { ok: false, error: 'config' });

  const text = `پیام جدید از وب‌سایت رزومه\n\nنام: ${name}\n\nراه ارتباطی: ${contact}\n\nپیام:\n${message}`;
  const r = await api('sendMessage', { chat_id: owner(), text, disable_web_page_preview: true });
  return r.ok ? json(200, { ok: true }) : json(502, { ok: false, error: 'telegram' });
};
