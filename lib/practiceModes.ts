import type { QuestionType } from "./questions";

export type PracticeMode =
  | "smart"
  | "meaning"
  | "article"
  | "plural"
  | "translation"
  | "mixed";

export type PracticeModeConfig = {
  id: PracticeMode;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  types: QuestionType[];
};

export const PRACTICE_MODES: Record<PracticeMode, PracticeModeConfig> = {
  smart: {
    id: "smart",
    label: "Smart Practice",
    shortLabel: "Smart",
    description: "The portal chooses what you need most.",
    icon: "✨",
    types: ["meaning", "article", "plural", "translation"]
  },
  meaning: {
    id: "meaning",
    label: "Meanings",
    shortLabel: "Meanings",
    description: "German → English recognition.",
    icon: "🧠",
    types: ["meaning"]
  },
  article: {
    id: "article",
    label: "Articles",
    shortLabel: "Articles",
    description: "Practice der, die and das.",
    icon: "🔤",
    types: ["article"]
  },
  plural: {
    id: "plural",
    label: "Plurals",
    shortLabel: "Plurals",
    description: "Train German plural forms.",
    icon: "🔁",
    types: ["plural"]
  },
  translation: {
    id: "translation",
    label: "German Recall",
    shortLabel: "Recall",
    description: "English → German from memory.",
    icon: "✍️",
    types: ["translation"]
  },
  mixed: {
    id: "mixed",
    label: "All Skills",
    shortLabel: "All Skills",
    description: "Mix meanings, articles, plurals and recall.",
    icon: "🎯",
    types: ["meaning", "article", "plural", "translation"]
  }
};

export function parsePracticeMode(value: string | null | undefined): PracticeMode {
  if (value && value in PRACTICE_MODES) return value as PracticeMode;
  return "smart";
}
