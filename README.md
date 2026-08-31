# German Learning Portal — GitHub Pages edition (v9)

A client-side German learning portal built with Next.js, TypeScript and Framer Motion.

## What v9 adds

- Smart Practice keeps the existing spaced-repetition mix
- Focused Practice lets you drill only:
  - Meanings (German → English)
  - Articles (`der / die / das`)
  - Plurals
  - German Recall (English → German)
  - All Skills
- Focused sessions still prioritize due and weak word-skills inside the selected category
- Adaptive retry-after-mistake behavior remains active
- Focused results show mastery for the skill you actually practiced
- Existing browser progress remains compatible

## Existing features

- GitHub Pages static export
- Automatic GitHub Actions deployment on every push to `main`
- Topic-based JSON study data in `data/topics/`
- Automatic data validation/merge before each build
- Noun articles support `der`, `die`, and `das`
- Local mastery and spaced repetition

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy to GitHub Pages

1. Upload/commit the project to the `main` branch.
2. On GitHub open **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. The included deployment workflow rebuilds the website after each commit.

The deployment workflow lives at:

`.github/workflows/deploy-pages.yml`

## Add new German material

See `DATA_FORMAT.md`.

Put a validated topic JSON file in `data/topics/`, commit it, and GitHub Pages will rebuild automatically.

## Where progress is stored

Study attempts and spaced-repetition mastery are currently stored in browser `localStorage`.

Refreshing or deploying new code does not normally erase progress on the same browser/domain. A different browser/device has separate progress until cloud sync is added later.
