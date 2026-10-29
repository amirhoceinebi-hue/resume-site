# Amirhossein Ebrahimi — Résumé Site (Netlify)
`public/` = the site. `netlify/functions/` = backend (contact form, Telegram bot webhook). **Functions need a Git or CLI deploy; Netlify's drag-and-drop does not deploy them.**

## Deploy (Git)
1. Put this whole folder in a GitHub repo.
2. Netlify → Add new project → Import from Git → pick the repo (build command empty; settings come from `netlify.toml`).
3. Project configuration → Environment variables: `TELEGRAM_BOT_TOKEN` (from @BotFather) and `TELEGRAM_CHAT_ID` (your numeric id).
4. Deploys → Trigger deploy → Deploy project (variables only apply to new deploys).
5. Open `https://YOUR-SITE.netlify.app/api/setup` once — it must say "OK - webhook set". This connects the bot.

## Deploy (CLI alternative, from a computer)
    npm i -g netlify-cli && netlify login && netlify deploy --prod   (then do steps 3 and 5)

## How the bot works
- Anyone sending /start gets a welcome message; any message they send is relayed to you with a header line `شناسه: <id>`.
- To answer: **Reply** (swipe) to that message in your chat with the bot; your reply is copied to the user.
- Text and media with a caption can be answered; stickers/video notes have no caption, so they arrive without the id line.
- Website form messages arrive in the same chat (they can't be answered through the bot — the visitor leaves a contact method).

## Security
Token only lives in Netlify env vars. The webhook rejects requests without a secret derived from the token. Rotate the token with /revoke in @BotFather and update the variable if it ever leaks.
