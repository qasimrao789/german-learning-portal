# German Learning Portal — Complete Consolidated Project

This is the consolidated project version. It is intended to replace the earlier partial update files.

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

## Vocabulary currently included

The generated vocabulary is built from all JSON files in `data/topics/`.
At the time this complete project was prepared it contains 130 vocabulary items from 2 topic files.

## Important progress note

The existing localStorage keys were intentionally kept unchanged so deploying this version at the same GitHub Pages URL should continue to use the progress already stored in that browser.
