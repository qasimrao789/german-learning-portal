import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const vocabFile = path.join(root, "data", "generated-vocabulary.json");
const outputDir = path.join(root, "public", "audio", "vocabulary");
const manifestFile = path.join(outputDir, "manifest.json");

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "Xb7hH8MSUJpSbSDYk0k2";
const VOICE_NAME = process.env.ELEVENLABS_VOICE_NAME ?? "Alice - Clear, Engaging Educator";
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2";
const OUTPUT_FORMAT = "mp3_44100_128";

const force = process.argv.includes("--force");
const limitArg = process.argv.find(arg => arg.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : null;

if (!API_KEY) {
  console.error(
    "Missing ELEVENLABS_API_KEY.\n\n" +
      "Create a local .env file in the project root containing:\n" +
      "ELEVENLABS_API_KEY=your_private_key_here\n\n" +
      "Then run: npm run audio:generate"
  );
  process.exit(1);
}

function audioStem(vocabId) {
  return vocabId
    .trim()
    .toLowerCase()
    .replace(/:/g, "--")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function requestAudio(text, attempt = 1) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=${OUTPUT_FORMAT}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID
      })
    }
  );

  if (response.ok) {
    return Buffer.from(await response.arrayBuffer());
  }

  const body = await response.text();
  const retriable = response.status === 429 || response.status >= 500;

  if (retriable && attempt < 4) {
    const delay = 1000 * 2 ** (attempt - 1);
    console.log(`  ElevenLabs returned ${response.status}; retrying in ${delay / 1000}s…`);
    await wait(delay);
    return requestAudio(text, attempt + 1);
  }

  throw new Error(`ElevenLabs ${response.status}: ${body}`);
}

const vocabulary = JSON.parse(await fs.readFile(vocabFile, "utf8"));
const selected = Number.isFinite(limit) && limit > 0 ? vocabulary.slice(0, limit) : vocabulary;

await fs.mkdir(outputDir, { recursive: true });

let generated = 0;
let skipped = 0;
let characterCount = 0;
const manifest = {
  generatedAt: new Date().toISOString(),
  voiceId: VOICE_ID,
  voiceName: VOICE_NAME,
  modelId: MODEL_ID,
  outputFormat: OUTPUT_FORMAT,
  files: []
};

console.log(`Voice: ${VOICE_NAME}`);
console.log(`Voice ID: ${VOICE_ID}`);
console.log(`Model: ${MODEL_ID}`);
console.log(`Vocabulary items: ${selected.length}`);
console.log("Generating two safe variants per noun:");
console.log("  full = article + noun (used in normal practice)");
console.log("  word = noun only (used during article questions so the answer is not revealed)\n");

for (const [index, item] of selected.entries()) {
  const stem = audioStem(item.id);
  const variants = [
    { variant: "full", text: `${item.article} ${item.german}` },
    { variant: "word", text: item.german }
  ];

  console.log(`[${index + 1}/${selected.length}] ${item.article} ${item.german}`);

  for (const entry of variants) {
    const filename = `${stem}-${entry.variant}.mp3`;
    const filepath = path.join(outputDir, filename);
    const relativePath = `audio/vocabulary/${filename}`;
    let exists = false;

    try {
      await fs.access(filepath);
      exists = true;
    } catch {}

    if (exists && !force) {
      skipped += 1;
      console.log(`  ↳ ${entry.variant}: skipped (already exists)`);
    } else {
      const audio = await requestAudio(entry.text);
      await fs.writeFile(filepath, audio);
      generated += 1;
      characterCount += entry.text.length;
      console.log(`  ↳ ${entry.variant}: generated`);
      await wait(120);
    }

    manifest.files.push({
      vocabId: item.id,
      variant: entry.variant,
      text: entry.text,
      path: relativePath
    });
  }
}

await fs.writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log("\nDone.");
console.log(`Generated: ${generated} MP3 file(s)`);
console.log(`Skipped: ${skipped} existing file(s)`);
console.log(`New characters sent to ElevenLabs this run: ${characterCount}`);
console.log(`Audio folder: ${outputDir}`);
console.log("\nThe files are static. Commit them to GitHub and the live portal will play them without calling ElevenLabs.");
