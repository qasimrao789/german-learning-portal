import { vocabulary, VocabItem } from "../data/vocabulary";

export type QuestionType = "meaning" | "article" | "plural" | "translation";
export type StudyReason = "due" | "new" | "refresh";

export type StudyTarget = {
  vocabId: string;
  questionType: QuestionType;
  reason: StudyReason;
};

export type Question = {
  id: string;
  item: VocabItem;
  type: QuestionType;
  prompt: string;
  correctAnswer: string;
  options?: string[];
  isRetry?: boolean;
  retryCount?: number;
  studyReason?: StudyReason;
};

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

function meaning(
  item: VocabItem,
  retryCount = 0,
  studyReason?: StudyReason
): Question {
  const distractors = shuffle(
    vocabulary.filter(v => v.id !== item.id).map(v => v.english)
  ).slice(0, 3);

  return {
    id: `${item.id}-meaning-${Date.now()}-${Math.random()}`,
    item,
    type: "meaning",
    prompt: retryCount
      ? `Quick retry: what does "${item.article} ${item.german}" mean?`
      : `What does "${item.article} ${item.german}" mean?`,
    correctAnswer: item.english,
    options: shuffle([item.english, ...distractors]),
    isRetry: retryCount > 0,
    retryCount,
    studyReason
  };
}

function article(
  item: VocabItem,
  retryCount = 0,
  studyReason?: StudyReason
): Question {
  return {
    id: `${item.id}-article-${Date.now()}-${Math.random()}`,
    item,
    type: "article",
    prompt: retryCount
      ? `Quick retry: choose the article for "${item.german}"`
      : `Choose the correct article for "${item.german}"`,
    correctAnswer: item.article,
    options: ["der", "die", "das"],
    isRetry: retryCount > 0,
    retryCount,
    studyReason
  };
}

function plural(
  item: VocabItem,
  retryCount = 0,
  studyReason?: StudyReason
): Question {
  if (!item.plural) {
    throw new Error(`Plural practice is unavailable for ${item.article} ${item.german}.`);
  }

  return {
    id: `${item.id}-plural-${Date.now()}-${Math.random()}`,
    item,
    type: "plural",
    prompt: retryCount
      ? `Quick retry: plural of "${item.article} ${item.german}"`
      : `What is the plural of "${item.article} ${item.german}"?`,
    correctAnswer: item.plural,
    isRetry: retryCount > 0,
    retryCount,
    studyReason
  };
}

function translation(
  item: VocabItem,
  retryCount = 0,
  studyReason?: StudyReason
): Question {
  return {
    id: `${item.id}-translation-${Date.now()}-${Math.random()}`,
    item,
    type: "translation",
    prompt: retryCount
      ? `Quick retry: write "${item.english}" in German`
      : `Translate into German: "${item.english}"`,
    correctAnswer: `${item.article} ${item.german}`,
    isRetry: retryCount > 0,
    retryCount,
    studyReason
  };
}

const makers: Record<
  QuestionType,
  (item: VocabItem, retryCount?: number, studyReason?: StudyReason) => Question
> = {
  meaning,
  article,
  plural,
  translation
};

export function buildSession(targets: StudyTarget[]): Question[] {
  return targets
    .map(target => {
      const item = vocabulary.find(v => v.id === target.vocabId);
      return item
        ? makers[target.questionType](item, 0, target.reason)
        : null;
    })
    .filter((question): question is Question => Boolean(question));
}

export function createRetryQuestion(question: Question): Question {
  const nextRetryCount = (question.retryCount ?? 0) + 1;
  return makers[question.type](question.item, nextRetryCount, question.studyReason);
}

export function normalizeAnswer(value: string) {
  return value.trim().toLocaleLowerCase("de-DE").replace(/\s+/g, " ");
}

export function isCorrectAnswer(user: string, correct: string) {
  const normalizedUser = normalizeAnswer(user);
  const accepted = correct
    .split("/")
    .map(part => normalizeAnswer(part))
    .map(part => part.trim());

  return accepted.includes(normalizedUser) || normalizeAnswer(correct) === normalizedUser;
}

export function isCorrectQuestionAnswer(user: string, question: Question) {
  if (question.type === "plural") {
    const normalizedUser = normalizeAnswer(user);
    const plurals = question.correctAnswer
      .split("/")
      .map(part => normalizeAnswer(part))
      .filter(Boolean);

    return plurals.some(
      plural => normalizedUser === plural || normalizedUser === `die ${plural}`
    );
  }

  return isCorrectAnswer(user, question.correctAnswer);
}
