# Portfolio Timeline

A data-driven, horizontally-scrolling timeline portfolio built with React, plain CSS, and Vite.

## Adding a timeline event

Edit `src/data/timelineEvents.js` and add a new object to the array — anywhere in the array, in any order. Events are sorted by `date` automatically before rendering, so you never need to keep the list in chronological order by hand.

```js
{
  id: 'unique-slug',
  date: '2025-03',                 // "YYYY-MM-DD" or "YYYY-MM"
  title: 'Title',
  description: 'Short description.',
  category: 'career',              // 'career' | 'project' | 'personal'
  image: someImportedImage,        // optional
  imageAlt: 'Description',         // required if image is set
  link: 'https://example.com',     // optional
  endDate: '2026-01',              // optional, for ranged events
}
```

In dev mode, malformed entries (missing fields, bad dates, invalid category, missing `imageAlt`) log a console warning instead of crashing the page.

## Development

```bash
npm install
npm run dev          # start the dev server
npm run lint         # eslint
npm run format       # prettier --write
npm run format:check # prettier --check
npm run build         # production build to dist/
npm run preview       # preview the production build
```

## Deployment

Static Vite output (`dist/`) deploys to Vercel or Netlify with no extra configuration — Vercel auto-detects the Vite framework preset, and `netlify.toml` pins the build command/publish directory for Netlify.
