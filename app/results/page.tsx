"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  formatReviewTime,
  getLearningOverview,
  getWeakWords,
  WeakWord
} from "../../lib/storage";
import type { PracticeMode } from "../../lib/practiceModes";

const skillLabels: Record<string, string> = {
  meaning: "Meaning",
  article: "Article",
  plural: "Plural",
  translation: "Recall"
};

export default function ResultsPage() {
  const [result, setResult] = useState({
    correct: 0,
    total: 20,
    mistakes: 0,
    retries: 0,
    masteryBefore: 0,
    masteryAfter: 0,
    masteryLabel: "Long-term mastery",
    mode: "smart" as PracticeMode,
    modeLabel: "Smart Practice",
    dueCompleted: 0,
    newCompleted: 0,
    refreshCompleted: 0,
    dueNext: 0,
    dueTomorrow: 0
  });
  const [weakWords, setWeakWords] = useState<WeakWord[]>([]);
  const [nextReview, setNextReview] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("latest-session-result");
      if (stored) setResult(previous => ({ ...previous, ...JSON.parse(stored) }));
    } catch {}
    setWeakWords(getWeakWords(4));
    setNextReview(getLearningOverview().nextReviewAt);
  }, []);

  const percent = result.total
    ? Math.round((result.correct / result.total) * 100)
    : 0;
  const masteryDelta = result.masteryAfter - result.masteryBefore;

  return (
    <main className="shell">
      <div className="card" style={{ marginTop: 48 }}>
        <div className="center" style={{ fontSize: 48 }}>
          🎉
        </div>
        <h1 className="center" style={{ marginBottom: 0 }}>
          Session complete
        </h1>
        <div className="center resultModeLine">
          <span className="pill">{result.modeLabel}</span>
        </div>

        <div className="resultsPercent">{percent}%</div>
        <p className="center muted" style={{ marginTop: 4 }}>
          accuracy across {result.total} total attempts
        </p>
        <p className="center resultsBreakdown">
          <strong>{result.correct} correct</strong>
          <span>•</span>
          <strong>{result.mistakes} incorrect</strong>
        </p>

        <div className="masteryResultCard">
          <div>
            <span>{result.masteryLabel}</span>
            <strong>
              {result.masteryBefore}% → {result.masteryAfter}%
            </strong>
          </div>
          <span className={`masteryDelta ${masteryDelta >= 0 ? "up" : "down"}`}>
            {masteryDelta >= 0 ? "+" : ""}{masteryDelta}%
          </span>
        </div>

        <div className="stats" style={{ margin: "18px 0" }}>
          <div className="stat">
            <strong>{result.dueCompleted}</strong>
            <span className="muted">Due reviews done</span>
          </div>
          <div className="stat">
            <strong>{result.newCompleted}</strong>
            <span className="muted">New skills started</span>
          </div>
        </div>

        <div className="scheduleSummary">
          <div>
            <span>Next review</span>
            <strong>{formatReviewTime(nextReview)}</strong>
          </div>
          <div>
            <span>Due tomorrow</span>
            <strong>{result.dueTomorrow}</strong>
          </div>
        </div>

        {result.retries > 0 && (
          <p className="muted center resultRetryLine">
            {result.retries} adaptive retr{result.retries === 1 ? "y" : "ies"} were inserted after mistakes.
          </p>
        )}

        {weakWords.length > 0 && (
          <div className="resultsWeaknesses">
            <div className="questionType">NEXT FOCUS</div>
            <div className="focusList">
              {weakWords.map(word => (
                <div className="focusRow" key={word.vocabId}>
                  <div className="focusWord">
                    <strong>{word.german}</strong>
                    <span>{word.english}</span>
                  </div>
                  <div className="focusScore">
                    <span>{skillLabels[word.weakestSkill]}</span>
                    <strong>{word.weakestSkillScore}%</strong>
                    <small>{formatReviewTime(word.nextReviewAt)}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link href="/">
          <button className="primaryButton" style={{ marginTop: 22 }}>
            Back Home
          </button>
        </Link>

        <Link href={`/practice?mode=${result.mode}`}>
          <button className="secondaryButton" style={{ marginTop: 10 }}>
            Practice {result.modeLabel} Again
          </button>
        </Link>
      </div>
    </main>
  );
}
