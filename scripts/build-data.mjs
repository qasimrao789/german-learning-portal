import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const topicsDir = path.join(root, "data", "topics");
const outputFile = path.join(root, "data", "generated-vocabulary.json");
const allowedArticles = new Set(["der", "die", "das"]);

const files = fs
  .readdirSync(topicsDir)
  .filter(name => name.endsWith(".json"))
  .sort();

if (!files.length) {
  throw new Error("No topic JSON files found in data/topics.");
}

const ids = new Set();
const vocabulary = [];

for (const file of files) {
  const fullPath = path.join(topicsDir, file);
  let topic;

  try {
    topic = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    throw new Error(`Could not parse ${file}: ${error.message}`);
  }

  if (!topic.topicId || !topic.title || !topic.level || !Array.isArray(topic.items)) {
    throw new Error(
      `${file} must contain topicId, title, level and an items array.`
    );
  }

  for (const [index, item] of topic.items.entries()) {
    const label = `${file} item ${index + 1}`;

    if (typeof item.id !== "string" || !item.id.trim()) {
      throw new Error(`${label}: id must be a non-empty stable string.`);
    }
    const stableId = item.id.trim();
    if (ids.has(stableId)) {
      throw new Error(`${label}: duplicate id ${stableId}.`);
    }
    ids.add(stableId);

    if ((item.type ?? "noun") !== "noun") {
      throw new Error(
        `${label}: v7 currently supports noun items only. Found type=${item.type}.`
      );
    }
    if (!item.german?.trim() || !item.english?.trim()) {
      throw new Error(`${label}: german and english are required.`);
    }
    if (!allowedArticles.has(item.article)) {
      throw new Error(`${label}: article must be der, die or das.`);
    }
    const plural = item.plural == null ? null : String(item.plural).trim();
    if (plural === "") {
      throw new Error(`${label}: plural must be a non-empty string or null.`);
    }

    vocabulary.push({
      id: stableId,
      type: "noun",
      german: item.german.trim(),
      english: item.english.trim(),
      article: item.article,
      plural,
      level: topic.level,
      topicId: topic.topicId,
      topicTitle: topic.title
    });
  }
}

vocabulary.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
fs.writeFileSync(outputFile, `${JSON.stringify(vocabulary, null, 2)}\n`, "utf8");
console.log(`Built ${vocabulary.length} vocabulary items from ${files.length} topic file(s).`);
