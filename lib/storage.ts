import { vocabulary } from "../data/vocabulary";
import type { QuestionType, StudyReason, StudyTarget } from "./questions";

export type Attempt = {
  questionId: string;
  vocabId: string;
  questionType: QuestionType;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  answeredAt: string;
  isRetry?: boolean;
};

export type MasteryRecord = {
  vocabId: string;
  questionType: QuestionType;
  mastery: number;
  streak: number;
  lapses: number;
  reviews: number;
  intervalDays: number;
  lastReviewedAt: string;
  nextReviewAt: string;
};

export type WeakWord = {
  vocabId: string;
  german: string;
  english: string;
  score: number;
  attempts: number;
  mistakes: number;
  weakestSkill: QuestionType;
  weakestSkillScore: number;
  nextReviewAt: string | null;
};

export type SkillStat = {
  type: QuestionType;
  score: number;
  attempts: number;
};

export type StudyPlan = {
  targets: StudyTarget[];
  dueCount: number;
  newCount: number;
  refreshCount: number;
};

export type LearningOverview = {
  overallMastery: number;
  learnedSkills: number;
  totalSkills: number;
  dueNow: number;
  dueTomorrow: number;
  nextReviewAt: string | null;
};

const ATTEMPTS_KEY = "german-a1-attempts";
const MASTERY_KEY = "german-a1-mastery-v1";
export const ALL_QUESTION_TYPES: QuestionType[] = ["meaning", "article", "plural", "translation"];
const DAY_MS = 24 * 60 * 60 * 1000;

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function keyOf(vocabId: string, questionType: QuestionType) {
  return `${vocabId}:${questionType}`;
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS);
}

function startOfTomorrow(now = new Date()) {
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);
  return tomorrow;
}

function endOfTomorrow(now = new Date()) {
  const end = startOfTomorrow(now);
  end.setDate(end.getDate() + 1);
  return end;
}

function intervalForStreak(streak: number) {
  if (streak <= 1) return 1;
  if (streak === 2) return 3;
  if (streak === 3) return 7;
  if (streak === 4) return 14;
  if (streak === 5) return 30;
  return Math.min(120, 30 + (streak - 5) * 15);
}

function applyAttempt(
  previous: MasteryRecord | undefined,
  attempt: Attempt,
  nowOverride?: Date
): MasteryRecord {
  const now = nowOverride ?? new Date(attempt.answeredAt || Date.now());
  const existing: MasteryRecord = previous ?? {
    vocabId: attempt.vocabId,
    questionType: attempt.questionType,
    mastery: 20,
    streak: 0,
    lapses: 0,
    reviews: 0,
    intervalDays: 0,
    lastReviewedAt: now.toISOString(),
    nextReviewAt: now.toISOString()
  };

  if (!attempt.isCorrect) {
    return {
      ...existing,
      mastery: clamp(existing.mastery - (existing.reviews ? 14 : 8)),
      streak: 0,
      lapses: existing.lapses + 1,
      reviews: existing.reviews + 1,
      intervalDays: 1,
      lastReviewedAt: now.toISOString(),
      // The in-session retry handles immediate relearning. Future review is tomorrow.
      nextReviewAt: addDays(now, 1).toISOString()
    };
  }

  const nextStreak = attempt.isRetry
    ? Math.max(1, existing.streak)
    : existing.streak + 1;
  const intervalDays = attempt.isRetry ? 1 : intervalForStreak(nextStreak);
  const gain = attempt.isRetry ? 7 : existing.reviews === 0 ? 18 : 11;

  return {
    ...existing,
    mastery: clamp(existing.mastery + gain),
    streak: nextStreak,
    reviews: existing.reviews + 1,
    intervalDays,
    lastReviewedAt: now.toISOString(),
    nextReviewAt: addDays(now, intervalDays).toISOString()
  };
}

export function getAttempts(): Attempt[] {
  if (typeof window === "undefined") return [];
  try {
    const rows = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || "[]") as Attempt[];
    return rows.map(row => ({ ...row, vocabId: String(row.vocabId) }));
  } catch {
    return [];
  }
}

function readMasteryRaw(): MasteryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const rows = JSON.parse(localStorage.getItem(MASTERY_KEY) || "[]") as MasteryRecord[];
    return rows.map(row => ({ ...row, vocabId: String(row.vocabId) }));
  } catch {
    return [];
  }
}

function saveMastery(records: MasteryRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MASTERY_KEY, JSON.stringify(records));
}

function migrateOldAttemptsIfNeeded() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(MASTERY_KEY) !== null) return;

  const attempts = [...getAttempts()].sort(
    (a, b) =>
      new Date(a.answeredAt).getTime() - new Date(b.answeredAt).getTime()
  );
  const map = new Map<string, MasteryRecord>();

  for (const attempt of attempts) {
    const key = keyOf(attempt.vocabId, attempt.questionType);
    map.set(
      key,
      applyAttempt(map.get(key), attempt, new Date(attempt.answeredAt))
    );
  }

  saveMastery([...map.values()]);
}

export function getMasteryRecords(): MasteryRecord[] {
  if (typeof window === "undefined") return [];
  migrateOldAttemptsIfNeeded();
  return readMasteryRaw();
}

export function saveAttempt(attempt: Attempt) {
  if (typeof window === "undefined") return;

  // Load/migrate mastery BEFORE appending this new attempt so an old v5
  // history is replayed exactly once.
  const records = getMasteryRecords();
  localStorage.setItem(
    ATTEMPTS_KEY,
    JSON.stringify([...getAttempts(), attempt])
  );

  const key = keyOf(attempt.vocabId, attempt.questionType);
  const existingIndex = records.findIndex(
    record => keyOf(record.vocabId, record.questionType) === key
  );
  const previous = existingIndex >= 0 ? records[existingIndex] : undefined;
  const next = applyAttempt(previous, attempt, new Date(attempt.answeredAt));

  if (existingIndex >= 0) records[existingIndex] = next;
  else records.push(next);

  saveMastery(records);
}

export function getSkillStats(): SkillStat[] {
  const records = getMasteryRecords();

  return ALL_QUESTION_TYPES.map(type => {
    const matching = records.filter(record => record.questionType === type);
    const totalReviews = matching.reduce((sum, row) => sum + row.reviews, 0);
    return {
      type,
      score: matching.length
        ? Math.round(
            matching.reduce((sum, row) => sum + row.mastery, 0) /
              matching.length
          )
        : 0,
      attempts: totalReviews
    };
  });
}

export function getWeakWords(limit = 5): WeakWord[] {
  const records = getMasteryRecords();
  const attempts = getAttempts();

  return vocabulary
    .flatMap<WeakWord>(item => {
      const itemRecords = records.filter(record => record.vocabId === item.id);
      if (!itemRecords.length) return [];

      const weakest = [...itemRecords].sort((a, b) => {
        if (a.mastery !== b.mastery) return a.mastery - b.mastery;
        return b.lapses - a.lapses;
      })[0];

      const rows = attempts.filter(attempt => attempt.vocabId === item.id);
      const mistakes = rows.filter(attempt => !attempt.isCorrect).length;
      const score = Math.round(
        itemRecords.reduce((sum, row) => sum + row.mastery, 0) /
          itemRecords.length
      );

      return [{
        vocabId: item.id,
        german: `${item.article} ${item.german}`,
        english: item.english,
        score,
        attempts: rows.length,
        mistakes,
        weakestSkill: weakest.questionType,
        weakestSkillScore: weakest.mastery,
        nextReviewAt: weakest.nextReviewAt
      }];
    })
    .sort((a, b) => {
      if (a.weakestSkillScore !== b.weakestSkillScore)
        return a.weakestSkillScore - b.weakestSkillScore;
      if (a.mistakes !== b.mistakes) return b.mistakes - a.mistakes;
      return b.attempts - a.attempts;
    })
    .slice(0, limit);
}


function isQuestionTypeAvailable(
  vocabId: string,
  questionType: QuestionType
) {
  const item = vocabulary.find(v => v.id === vocabId);
  if (!item) return false;
  return questionType !== "plural" || Boolean(item.plural);
}

function allPossibleTargets(allowedTypes: QuestionType[] = ALL_QUESTION_TYPES) {
  return vocabulary.flatMap(item =>
    allowedTypes
      .filter(questionType => questionType !== "plural" || Boolean(item.plural))
      .map(questionType => ({ vocabId: item.id, questionType }))
  );
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export function getStudyPlan(
  count = 20,
  allowedTypes: QuestionType[] = ALL_QUESTION_TYPES
): StudyPlan {
  const records = getMasteryRecords();
  const now = Date.now();
  const byKey = new Map(
    records.map(record => [keyOf(record.vocabId, record.questionType), record])
  );

  const allowed = new Set(allowedTypes);

  const due = [...records]
    .filter(
      record =>
        allowed.has(record.questionType) &&
        isQuestionTypeAvailable(record.vocabId, record.questionType) &&
        new Date(record.nextReviewAt).getTime() <= now
    )
    .sort((a, b) => {
      const dueDelta =
        new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime();
      if (dueDelta !== 0) return dueDelta;
      return a.mastery - b.mastery;
    });

  const newTargets = shuffle(
    allPossibleTargets(allowedTypes).filter(
      target => !byKey.has(keyOf(target.vocabId, target.questionType))
    )
  );

  const futureWeak = [...records]
    .filter(
      record =>
        allowed.has(record.questionType) &&
        isQuestionTypeAvailable(record.vocabId, record.questionType) &&
        new Date(record.nextReviewAt).getTime() > now
    )
    .sort((a, b) => a.mastery - b.mastery);

  const selected: StudyTarget[] = [];
  const used = new Set<string>();

  const add = (
    vocabId: string,
    questionType: QuestionType,
    reason: StudyReason
  ) => {
    const key = keyOf(vocabId, questionType);
    if (selected.length >= count || used.has(key)) return;
    used.add(key);
    selected.push({ vocabId, questionType, reason });
  };

  // Spaced repetition comes first: never skip a due review for a new item.
  for (const record of due) add(record.vocabId, record.questionType, "due");

  // Once due work is covered, introduce new word/skill pairs.
  for (const target of newTargets) {
    if (selected.length >= count) break;
    add(target.vocabId, target.questionType, "new");
  }

  // When everything has been seen, fill a session with the weakest future items.
  for (const record of futureWeak) {
    if (selected.length >= count) break;
    add(record.vocabId, record.questionType, "refresh");
  }

  return {
    targets: selected,
    dueCount: selected.filter(target => target.reason === "due").length,
    newCount: selected.filter(target => target.reason === "new").length,
    refreshCount: selected.filter(target => target.reason === "refresh").length
  };
}

export function getLearningOverview(): LearningOverview {
  const records = getMasteryRecords();
  const now = new Date();
  const tomorrowStart = startOfTomorrow(now);
  const tomorrowEnd = endOfTomorrow(now);
  const future = records
    .map(record => new Date(record.nextReviewAt))
    .filter(date => date.getTime() > now.getTime())
    .sort((a, b) => a.getTime() - b.getTime());

  const availableRecords = records.filter(record =>
    isQuestionTypeAvailable(record.vocabId, record.questionType)
  );
  const totalSkills = allPossibleTargets().length;

  return {
    overallMastery: availableRecords.length
      ? Math.round(
          availableRecords.reduce((sum, record) => sum + record.mastery, 0) /
            availableRecords.length
        )
      : 0,
    learnedSkills: availableRecords.length,
    totalSkills,
    dueNow: availableRecords.filter(
      record => new Date(record.nextReviewAt).getTime() <= now.getTime()
    ).length,
    dueTomorrow: availableRecords.filter(record => {
      const date = new Date(record.nextReviewAt).getTime();
      return date >= tomorrowStart.getTime() && date < tomorrowEnd.getTime();
    }).length,
    nextReviewAt: future[0]?.toISOString() ?? null
  };
}

export function formatReviewTime(iso: string | null) {
  if (!iso) return "Not scheduled";
  const date = new Date(iso);
  const now = new Date();
  const diff = date.getTime() - now.getTime();

  if (diff <= 0) return "Due now";
  if (diff < DAY_MS) {
    const hours = Math.max(1, Math.round(diff / (60 * 60 * 1000)));
    return `in ${hours}h`;
  }

  const days = Math.max(1, Math.round(diff / DAY_MS));
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}
