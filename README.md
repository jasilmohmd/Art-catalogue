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

## Project structure

- `app/` — Next.js page, metadata, and global styles.
- `components/` — artwork card, purchase button, and client-side gallery/lightbox.
- `public/artworks/` — source images and catalogue metadata encoded in filenames.
- `scripts/generate-artworks.mjs` — build-time artwork generator.
- `tests/` — generator tests using Node's built-in test runner.

The WhatsApp destination number is configured in `lib/whatsapp.ts`.
