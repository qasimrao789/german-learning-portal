import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const audioDir = path.join(root, "public", "audio", "vocabulary");

const idMap = {
  "1": "feminine-nouns-01:katze",
  "7": "feminine-nouns-01:frage",
  "2": "feminine-nouns-01:strasse",
  "24": "feminine-nouns-01:maschine",
  "11": "feminine-nouns-01:tasse",
  "12": "feminine-nouns-01:gabel",
  "6": "feminine-nouns-01:sprache",
  "15": "feminine-nouns-01:freundin",
  "8": "feminine-nouns-01:antwort",
  "13": "feminine-nouns-01:tochter",
  "9": "feminine-nouns-01:schule",
  "19": "feminine-nouns-01:nachricht",
  "10": "feminine-nouns-01:reise",
  "23": "feminine-nouns-01:ueberraschung",
  "20": "feminine-nouns-01:gelegenheit",
  "17": "feminine-nouns-01:aerztin",
  "18": "feminine-nouns-01:karte",
  "5": "feminine-nouns-01:zeitung",
  "21": "feminine-nouns-01:gesellschaft",
  "14": "feminine-nouns-01:tante",
  "16": "feminine-nouns-01:lehrerin",
  "3": "feminine-nouns-01:wohnung",
  "22": "feminine-nouns-01:entscheidung",
  "4": "feminine-nouns-01:flasche"
};

function audioStem(vocabId) {
  return vocabId
    .trim()
    .toLowerCase()
    .replace(/:/g, "--")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

let renamed = 0;
let removedOldDuplicate = 0;
let missing = 0;

for (const [oldId, newId] of Object.entries(idMap)) {
  for (const variant of ["full", "word"]) {
    const oldPath = path.join(audioDir, `${audioStem(oldId)}-${variant}.mp3`);
    const newPath = path.join(audioDir, `${audioStem(newId)}-${variant}.mp3`);

    let oldExists = true;
    try {
      await fs.access(oldPath);
    } catch {
      oldExists = false;
    }

    if (!oldExists) {
      missing += 1;
      continue;
    }

    let newExists = true;
    try {
      await fs.access(newPath);
    } catch {
      newExists = false;
    }

    if (newExists) {
      await fs.unlink(oldPath);
      removedOldDuplicate += 1;
    } else {
      await fs.rename(oldPath, newPath);
      renamed += 1;
    }
  }
}

console.log("Vocabulary ID audio migration complete.");
console.log(`Renamed audio files: ${renamed}`);
console.log(`Removed obsolete duplicates: ${removedOldDuplicate}`);
console.log(`Old files not found: ${missing}`);
console.log("\nNext run:");
console.log("npm run data:build");
console.log("npm run audio:generate");
console.log("\nThe audio generator should skip existing files and send 0 new characters for these renamed entries.");
