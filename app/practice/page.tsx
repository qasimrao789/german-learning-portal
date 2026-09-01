"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "../../components/ProgressBar";
import GermanCharacterBar from "../../components/GermanCharacterBar";
import MeaningHint from "../../components/MeaningHint";
import PronunciationButton from "../../components/PronunciationButton";
import {
  buildSession,
  createRetryQuestion,
  isCorrectAnswer,
  isCorrectQuestionAnswer,
  Question
} from "../../lib/questions";
import {
  PRACTICE_MODES,
  parsePracticeMode,
  PracticeMode
} from "../../lib/practiceModes";
import {
  getLearningOverview,
  getSkillStats,
  getStudyPlan,
  saveAttempt
} from "../../lib/storage";

const MAX_RETRIES_PER_QUESTION = 2;

function masteryForMode(mode: PracticeMode) {
  const config = PRACTICE_MODES[mode];
  if (config.types.length === 1) {
    return getSkillStats().find(stat => stat.type === config.types[0])?.score ?? 0;
  }
  return getLearningOverview().overallMastery;
}

function masteryLabelForMode(mode: PracticeMode) {
  switch (mode) {
    case "meaning":
      return "Meaning mastery";
    case "article":
      return "Article mastery";
    case "plural":
      return "Plural mastery";
    case "translation":
      return "German recall mastery";
    default:
      return "Long-term mastery";
  }
}

export default function PracticePage() {
  const router = useRouter();
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("smart");
  const [session, setSession] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [feedback, setFeedback] = useState<null | {
    correct: boolean;
    userAnswer: string;
    retryScheduled: boolean;
  }>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [masteryBefore, setMasteryBefore] = useState(0);
  const [corePlan, setCorePlan] = useState({ due: 0, new: 0, refresh: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = parsePracticeMode(params.get("mode"));
    const config = PRACTICE_MODES[mode];
    const plan = getStudyPlan(20, config.types);

    setPracticeMode(mode);
    setMasteryBefore(masteryForMode(mode));
    setCorePlan({
      due: plan.dueCount,
      new: plan.newCount,
      refresh: plan.refreshCount
    });
    setSession(buildSession(plan.targets));
  }, []);

  useEffect(() => {
    if (!feedback) return;

    requestAnimationFrame(() => {
      continueButtonRef.current?.focus();
    });
  }, [feedback]);

  const question = session[index];
  const modeConfig = PRACTICE_MODES[practiceMode];

  if (!question) {
    return (
      <main className="shell">
        <div className="card center" style={{ marginTop: 48 }}>
          Preparing your practice session…
        </div>
      </main>
    );
  }

  const scheduleRetry = () => {
    if ((question.retryCount ?? 0) >= MAX_RETRIES_PER_QUESTION) return false;

    const retry = createRetryQuestion(question);
    const gap = 4 + Math.floor(Math.random() * 3);
    const insertAt = Math.min(index + gap + 1, session.length);

    setSession(current => {
      const next = [...current];
      next.splice(insertAt, 0, retry);
      return next;
    });

    return true;
  };

  const submit = (answer: string) => {
    if (feedback) return;

    const correct = isCorrectQuestionAnswer(answer, question);
    let retryScheduled = false;

    if (correct) {
      setCorrectCount(value => value + 1);
    } else {
      setMistakeCount(value => value + 1);
      retryScheduled = scheduleRetry();
    }

    saveAttempt({
      questionId: question.id,
      vocabId: question.item.id,
      questionType: question.type,
      userAnswer: answer,
      correctAnswer: question.correctAnswer,
      isCorrect: correct,
      answeredAt: new Date().toISOString(),
      isRetry: question.isRetry
    });

    setFeedback({ correct, userAnswer: answer, retryScheduled });
  };

  const insertGermanCharacter = (character: string) => {
    const input = inputRef.current;
    const start = input?.selectionStart ?? typed.length;
    const end = input?.selectionEnd ?? typed.length;
    const nextValue = typed.slice(0, start) + character + typed.slice(end);

    setTyped(nextValue);

    requestAnimationFrame(() => {
      input?.focus();
      const nextCaret = start + character.length;
      input?.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const next = () => {
    if (index === session.length - 1) {
      const overviewAfter = getLearningOverview();
      const modeMasteryAfter = masteryForMode(practiceMode);
      sessionStorage.setItem(
        "latest-session-result",
        JSON.stringify({
          correct: correctCount,
          total: session.length,
          mistakes: mistakeCount,
          retries: session.filter(q => q.isRetry).length,
          masteryBefore,
          masteryAfter: modeMasteryAfter,
          masteryLabel: masteryLabelForMode(practiceMode),
          mode: practiceMode,
          modeLabel: modeConfig.label,
          dueCompleted: corePlan.due,
          newCompleted: corePlan.new,
          refreshCompleted: corePlan.refresh,
          dueNext: overviewAfter.dueNow,
          dueTomorrow: overviewAfter.dueTomorrow
        })
      );
      router.push("/results");
      return;
    }

    setIndex(value => value + 1);
    setTyped("");
    setFeedback(null);
  };

  const labels: Record<string, string> = {
    meaning: "MEANING",
    article: "ARTICLE",
    plural: "PLURAL",
    translation: "TRANSLATE"
  };

  const reasonLabels: Record<string, string> = {
    due: "DUE REVIEW",
    new: "NEW",
    refresh: "REFRESH"
  };

  return (
    <main className="shell">
      <div className="practiceTop">
        <button className="iconButton" onClick={() => router.push("/")}>
          ✕
        </button>
        <ProgressBar value={((index + 1) / session.length) * 100} />
        <strong>
          {index + 1}/{session.length}
        </strong>
      </div>

      <div className="practiceModeBanner">
        <span className="practiceModeBannerIcon" aria-hidden="true">
          {modeConfig.icon}
        </span>
        <div>
          <strong>{modeConfig.label}</strong>
          <span>{modeConfig.description}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22 }}
          className="card"
        >
          <div className="questionHeaderRow">
            <div className="questionType">{labels[question.type]}</div>
            <div className="questionPills">
              {question.isRetry ? (
                <span className="retryPill">↻ RETRY</span>
              ) : question.studyReason ? (
                <span className={`studyPill ${question.studyReason}`}>
                  {reasonLabels[question.studyReason]}
                </span>
              ) : null}
            </div>
          </div>
          <div className="questionPrompt">{question.prompt}</div>

          {(question.type === "article" || question.type === "meaning") && (
            <>
              {question.type === "article" ? (
                <div className="word wordWithAudio">
                  <span>
                    ___{" "}
                    <MeaningHint meaning={question.item.english}>
                      {question.item.german}
                    </MeaningHint>
                  </span>
                  <PronunciationButton
                    vocabId={question.item.id}
                    text={question.item.german}
                    variant="word"
                  />
                </div>
              ) : (
                <div className="word wordWithAudio">
                  <span>{question.item.article} {question.item.german}</span>
                  <PronunciationButton
                    vocabId={question.item.id}
                    text={`${question.item.article} ${question.item.german}`}
                  />
                </div>
              )}

              {question.type === "article" && !feedback && (
                <div className="meaningHintHelper">
                  Hover or tap the noun to see its meaning.
                </div>
              )}

              <div className="answers">
                {question.options?.map(option => {
                  const selected = feedback?.userAnswer === option;
                  const correctOption =
                    feedback && isCorrectAnswer(option, question.correctAnswer);

                  let className = "answerButton";
                  if (selected && feedback?.correct) className += " correct";
                  if (selected && feedback && !feedback.correct)
                    className += " wrong";
                  if (correctOption) className += " correct";

                  return (
                    <motion.button
                      whileTap={{ scale: 0.985 }}
                      className={className}
                      key={option}
                      onClick={() => submit(option)}
                    >
                      {option}
                    </motion.button>
                  );
                })}
              </div>
            </>
          )}

          {(question.type === "plural" || question.type === "translation") && (
            <>
              <div className={`word ${question.type === "plural" ? "wordWithAudio" : ""}`}>
                {question.type === "plural" ? (
                  <>
                    <MeaningHint meaning={question.item.english}>
                      {`${question.item.article} ${question.item.german}`}
                    </MeaningHint>
                    <PronunciationButton
                      vocabId={question.item.id}
                      text={`${question.item.article} ${question.item.german}`}
                    />
                  </>
                ) : (
                  question.item.english
                )}
              </div>

              {question.type === "plural" && !feedback && (
                <div className="meaningHintHelper">
                  Hover or tap the noun to see its meaning.
                </div>
              )}

              <input
                ref={inputRef}
                autoFocus
                className="textInput"
                value={typed}
                disabled={!!feedback}
                onChange={event => setTyped(event.target.value)}
                onKeyDown={event => {
                  if (event.key === "Enter" && typed.trim() && !feedback)
                    submit(typed);
                }}
                placeholder={
                  question.type === "translation"
                    ? "Type the German noun with article"
                    : "Type the plural (article optional)"
                }
              />

              <GermanCharacterBar
                disabled={!!feedback}
                onCharacter={insertGermanCharacter}
              />

              {!feedback && (
                <button
                  className="primaryButton"
                  style={{ marginTop: 14 }}
                  disabled={!typed.trim()}
                  onClick={() => submit(typed)}
                >
                  Check Answer
                </button>
              )}
            </>
          )}

          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`feedback ${feedback.correct ? "correct" : "wrong"}`}
            >
              <div className="feedbackTitle">
                {feedback.correct
                  ? question.isRetry
                    ? "✓ Nice recovery!"
                    : "✓ Richtig!"
                  : "Not quite"}
              </div>

              {!feedback.correct && (
                <div style={{ marginTop: 10 }}>
                  <div className="muted">Correct answer</div>
                  <div className="feedbackAnswer feedbackAnswerWithAudio">
                    <span>{question.correctAnswer}</span>
                    {question.type !== "plural" && (
                      <PronunciationButton
                        vocabId={question.item.id}
                        text={`${question.item.article} ${question.item.german}`}
                        variant="full"
                        compact
                      />
                    )}
                  </div>
                  {feedback.retryScheduled && (
                    <div className="retryNote">
                      ↻ This exact skill will return later in this session, and
                      it is scheduled for another review tomorrow.
                    </div>
                  )}
                </div>
              )}

              {feedback.correct && (question.type === "translation" || question.type === "article") && (
                <div className="correctPronunciationRow">
                  <span>{question.item.article} {question.item.german}</span>
                  <PronunciationButton
                    vocabId={question.item.id}
                    text={`${question.item.article} ${question.item.german}`}
                    compact
                  />
                </div>
              )}

              {feedback.correct && question.isRetry && (
                <div className="retryNote successNote">
                  You recovered the mistake. I&apos;ll still review this skill
                  again tomorrow before increasing its interval.
                </div>
              )}

              {feedback.correct &&
                !question.isRetry &&
                question.studyReason === "due" && (
                  <div className="retryNote successNote">
                    Review passed. Its next interval has been increased.
                  </div>
                )}

              <button
                ref={continueButtonRef}
                className="primaryButton footerAction"
                onClick={next}
              >
                {index === session.length - 1 ? "See Results" : "Continue"}
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
