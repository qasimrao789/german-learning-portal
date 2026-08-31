import generatedVocabulary from "./generated-vocabulary.json";

export type Article = "der" | "die" | "das";

export type VocabItem = {
  id: string;
  type: "noun";
  german: string;
  english: string;
  article: Article;
  plural: string | null;
  level: string;
  topicId: string;
  topicTitle: string;
};

export const vocabulary = generatedVocabulary as VocabItem[];
