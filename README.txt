German Learning Portal — vocabulary ID normalization

What this update does
---------------------
- Changes every feminine vocabulary ID to the stable format:
  feminine-nouns-01:word-slug
- The masculine topic already uses this format, so it does not need changing.
- Keeps all 113 complete feminine nouns.
- Does NOT regenerate the ElevenLabs audio you already paid/generated for.
- Includes a one-time script that renames the old audio files belonging to the
  original numeric IDs so the speaker buttons keep working.

Numeric IDs being replaced: 24
Audio files affected: 48

How to apply
------------
1. Copy the contents of this update into D:\GermanPortal and replace files.
2. In Command Prompt:

   cd /d D:\GermanPortal
   node scripts/normalize-audio-ids.mjs
   npm run data:build
   npm run audio:generate

3. Expected data build:
   Built 219 vocabulary items from 2 topic file(s).

4. The audio generator should mostly/all say "skipped (already exists)".
   The renamed entries should NOT need new ElevenLabs generation.

5. Then:

   git status
   git add .
   git commit -m "Normalize vocabulary IDs"
   git push

Progress note
-------------
The old progress records for the original numeric feminine IDs will no longer
match those renamed words. That is expected and acceptable for this cleanup.
Future IDs will be stable and descriptive.
