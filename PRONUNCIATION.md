# Pronunciation audio

The portal uses **pre-generated ElevenLabs MP3 files**, not live API calls from the website.
This keeps the API key private and makes playback free after generation.

## Current voice

- Voice: **Alice - Clear, Engaging Educator**
- Voice ID: `Xb7hH8MSUJpSbSDYk0k2`
- Model: `eleven_multilingual_v2`

You can override these locally with environment variables if you later choose another voice.

## One-time setup

Create `.env` in the project root:

```text
ELEVENLABS_API_KEY=your_private_key_here
```

`.env` is ignored by Git and must never be pushed to GitHub.

## Generate pronunciation for all vocabulary

```bash
npm run audio:generate
```

The generator first rebuilds vocabulary data, then creates static MP3s under:

```text
public/audio/vocabulary/
```

It generates two files per noun:

- `full`: article + noun, e.g. `der Tisch`
- `word`: noun only, e.g. `Tisch`

The noun-only version is used during **Article Practice** so audio does not reveal whether the answer is `der`, `die`, or `das`.

Existing MP3s are skipped automatically. When new vocabulary is added later, run the same command again and only missing files will be generated.

To deliberately regenerate everything:

```bash
npm run audio:generate -- --force
```

To test only the first 10 vocabulary items:

```bash
npm run audio:test
```

## Publish the audio

After listening to a few files, commit the generated MP3s with the rest of the project:

```bash
git add .
git commit -m "Add ElevenLabs pronunciation"
git push
```

GitHub Pages will serve the MP3s as normal static files. Pressing the speaker button on the live portal does not contact ElevenLabs and does not consume ElevenLabs credits.
