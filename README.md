# Sneha sparsham Art Catalogue

A static catalogue for original paintings. It is built with Next.js, TypeScript, Tailwind CSS, and a fullscreen image viewer. Customers can open an artwork and start a pre-filled WhatsApp purchase enquiry.

## Requirements

- Node.js 20 or later
- npm

## Commands

```powershell
npm install
npm run dev
npm run build
npm test
```

`npm run dev` starts the local site. `npm run build` creates the optimized production build in `.next/`. Both commands regenerate the catalogue before Next.js starts.

## Add or update artwork

Do not edit `data/artworks.ts` by hand. Add, rename, or remove an image directly in `public/artworks/`, then run `npm run dev` or `npm run build`.

Use this filename format:

```text
title_words-amount.extension
title_words-amount-sold.extension
```

Examples:

```text
sail_boat-1300.jpeg        # Sail Boat, INR 1,300, available
moon-night-1800-sold.png   # Moon Night, INR 1,800, sold
```

- Separate title words with underscores or hyphens.
- Use a whole-number price in INR.
- Add `-sold` immediately before the extension for unavailable artwork.
- Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, and `.avif`.
- Each title must create a unique ID; `sail_boat` and `sail-boat` are duplicates.

The generator sorts artworks alphabetically and writes the resulting TypeScript data to `data/artworks.ts`. Invalid filenames and unsupported formats stop the command with a clear error so no artwork is silently skipped.

## Telegram administration bot

The site includes a Telegram webhook at `/api/telegram`. It runs as a Vercel Function and commits artwork changes to GitHub; each commit triggers Vercel's normal deployment flow.

Only the Telegram user IDs listed in `TELEGRAM_ADMIN_IDS` can manage the catalogue. The bot supports:

- `/id` — return your Telegram user ID for initial setup.
- `/help` — show usage instructions.
- `/artworks` — list each artwork with View, Mark sold/available, and Delete controls.
- Send an image with the caption `Title | price` to add it. Add `| sold` as a third value to create an unavailable artwork.

Deletion requires a confirmation button. Images may be sent as a Telegram photo or image document and must be 10 MB or smaller.

### Configure Vercel

Add the following Production environment variables in the Vercel project settings. Never commit their real values; `.env.example` lists the keys only.

| Variable | Value |
| --- | --- |
| `TELEGRAM_BOT_TOKEN` | Token created through [@BotFather](https://t.me/BotFather). |
| `TELEGRAM_WEBHOOK_SECRET` | A random value using only letters, digits, `_`, and `-`. |
| `TELEGRAM_ADMIN_IDS` | Comma-separated Telegram user IDs allowed to manage artwork. |
| `GITHUB_TOKEN` | Fine-grained GitHub token with **Contents: Read and write** permission for this repository. |
| `GITHUB_REPOSITORY` | `jasilmohmd/Art-catalogue` |
| `GITHUB_BRANCH` | `main` |

Deploy after adding the variables. Send `/id` to the bot to get your ID, add it to `TELEGRAM_ADMIN_IDS`, then redeploy once more. The `/id` command is safe before an admin list has been configured; all catalogue actions remain locked down. The production Vercel URL must be publicly reachable by Telegram; do not protect the webhook behind Vercel login or a password.

Set the webhook after the production deployment is live. Replace the URL with the production Vercel domain and set the two PowerShell variables from the values stored in Vercel:

```powershell
$env:TELEGRAM_BOT_TOKEN = "your-bot-token"
$webhookSecret = "your-webhook-secret"
$webhookUrl = "https://your-project.vercel.app/api/telegram"

$body = @{
  url = $webhookUrl
  secret_token = $webhookSecret
  allowed_updates = @("message", "callback_query")
  drop_pending_updates = $true
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "https://api.telegram.org/bot$env:TELEGRAM_BOT_TOKEN/setWebhook" -ContentType "application/json" -Body $body
```

Verify it with:

```powershell
Invoke-RestMethod -Uri "https://api.telegram.org/bot$env:TELEGRAM_BOT_TOKEN/getWebhookInfo"
```

## Project structure

- `app/` — Next.js page, metadata, and global styles.
- `components/` — artwork card, purchase button, and client-side gallery/lightbox.
- `public/artworks/` — source images and catalogue metadata encoded in filenames.
- `scripts/generate-artworks.mjs` — build-time artwork generator.
- `app/api/telegram/route.ts` — authenticated Telegram webhook for catalogue administration.
- `lib/telegram-artwork-bot.mjs` — Telegram and GitHub API workflow.
- `tests/` — generator tests using Node's built-in test runner.

The WhatsApp destination number is configured in `lib/whatsapp.ts`.
