# Repository Guide

## Overview

This is a static Next.js App Router catalogue. Artwork metadata is generated from image filenames; there is no API, database, CMS, checkout flow, or authentication layer.

## Artwork workflow

- Place files directly in `public/artworks/`; nested folders are not scanned.
- Use `title_words-amount[-sold].extension`, for example `sail_boat-1300.jpeg` or `moon-night-1800-sold.png`.
- Supported extensions are `.jpg`, `.jpeg`, `.png`, `.webp`, and `.avif`.
- The price is a positive whole INR amount. Omit `-sold` for available work.
- Never manually edit `data/artworks.ts`; `scripts/generate-artworks.mjs` owns that generated file.
- The generator runs automatically through `predev` and `prebuild`. It fails on malformed filenames, unsupported formats, and duplicate IDs rather than omitting files.
- `data/artworks.ts` must remain synchronized with artwork files. The Telegram bot commits the image change and regenerated data file together, while local builds regenerate the same file.

## Telegram bot and deployment

- `app/api/telegram/route.ts` is a Node.js Vercel webhook. Do not move it to an Edge runtime because it uses Node crypto and buffers image uploads.
- Authenticate every webhook request with `TELEGRAM_WEBHOOK_SECRET` and restrict catalogue actions to `TELEGRAM_ADMIN_IDS`; never weaken either check.
- Bot credentials are Vercel environment variables only. Never add a real token to source control, documentation, or client-side `NEXT_PUBLIC_*` variables.
- The bot uses GitHub's Git Database API to commit artwork changes atomically. This lets Vercel rebuild from the same `main` branch without a separate database or file store.
- Preserve one-commit artwork mutations: add/remove/status changes must update the image file and generated `data/artworks.ts` together.

## Development and verification

- Use `npm run dev` for local development and `npm run build` for a production build.
- Run `npm test` after changing generator behavior or filename parsing.
- Run `npm run build` after changing the Telegram route or its shared module.
- Preserve the `Artwork` type and `artworks` export in the generated module because the gallery imports them directly.
- Keep the gallery's lightbox behavior client-side; `app/page.tsx` remains a server component that supplies generated artwork data.

## Commit hygiene

- Commit the source image changes and regenerated `data/artworks.ts` together.
- Do not commit `.next/`, `node_modules/`, or local editor settings unless explicitly required.
