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

## Development and verification

- Use `npm run dev` for local development and `npm run build` for a production build.
- Run `npm test` after changing generator behavior or filename parsing.
- Preserve the `Artwork` type and `artworks` export in the generated module because the gallery imports them directly.
- Keep the gallery's lightbox behavior client-side; `app/page.tsx` remains a server component that supplies generated artwork data.

## Commit hygiene

- Commit the source image changes and regenerated `data/artworks.ts` together.
- Do not commit `.next/`, `node_modules/`, or local editor settings unless explicitly required.
