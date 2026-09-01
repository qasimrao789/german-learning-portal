# German Learning Portal — Complete Consolidated Project v13

This is the complete consolidated project and includes all earlier portal features plus static ElevenLabs pronunciation audio support.

## Included features

- Smart Practice with spaced repetition
- Focused Practice modes:
  - Meanings (German → English)
  - Articles (der / die / das)
  - Plurals
  - German Recall (English → German)
  - All Skills / mixed practice
- Adaptive in-session retries after mistakes
- Long-term mastery tracking in browser localStorage
- German character buttons: ä ö ü ß
- Enter once to submit typed answers; Enter again to continue
- Hover/tap English meaning on Article and Plural questions
- Correct plural handling (article optional when typing a plural)
- Feminine noun topic
- Masculine noun topic
- Words without a useful plural are excluded from plural practice
- GitHub Pages static export configuration
- GitHub Actions deployment workflow
- Topic-based JSON data system for adding future material
- ElevenLabs pronunciation generation script
- Static pronunciation speaker buttons in practice, weak-word lists and results
- Article Practice uses noun-only audio so pronunciation never reveals der/die/das
- Existing audio is skipped when generating pronunciation for newly added vocabulary

## Pronunciation architecture

The public website never receives the ElevenLabs API key and never calls ElevenLabs directly.

Run `npm run audio:generate` locally. The script uses Alice (`Xb7hH8MSUJpSbSDYk0k2`) with `eleven_multilingual_v2` by default and creates MP3 files under `public/audio/vocabulary/`. Commit those MP3s to GitHub; GitHub Pages then serves them as static files with no per-play TTS charge.

See `PRONUNCIATION.md` for setup and usage.

## Vocabulary currently included

The generated vocabulary is built from all JSON files in `data/topics/`.
This version contains 130 vocabulary items from 2 topic files.

## Important progress note

The existing localStorage keys were intentionally kept unchanged, so deploying this version at the same GitHub Pages URL continues to use the progress already stored in that browser.
