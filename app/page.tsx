"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProgressBar from "../components/ProgressBar";
import { PRACTICE_MODES } from "../lib/practiceModes";
import {
  formatReviewTime,
  getAttempts,
  getLearningOverview,
  getSkillStats,
  getStudyPlan,
  getWeakWords,
  LearningOverview,
  SkillStat,
  WeakWord
} from "../lib/storage";

const EMPTY_OVERVIEW: LearningOverview = {
  overallMastery: 0,
  learnedSkills: 0,
  totalSkills: 0,
  dueNow: 0,
  dueTomorrow: 0,
  nextReviewAt: null
};

const focusedModes = [
  PRACTICE_MODES.meaning,
  PRACTICE_MODES.article,
  PRACTICE_MODES.plural,
  PRACTICE_MODES.translation,
  PRACTICE_MODES.mixed
];

export default function HomePage() {
  const [attempts, setAttempts] = useState(0);
  const [skills, setSkills] = useState<SkillStat[]>([]);
  const [weakWords, setWeakWords] = useState<WeakWord[]>([]);
  const [overview, setOverview] = useState<LearningOverview>(EMPTY_OVERVIEW);
  const [plan, setPlan] = useState({ dueCount: 0, newCount: 0, refreshCount: 0 });

  useEffect(() => {
    setAttempts(getAttempts().length);
    setSkills(getSkillStats());
    setWeakWords(getWeakWords(5));
    setOverview(getLearningOverview());
    const nextPlan = getStudyPlan(20);
    setPlan({
      dueCount: nextPlan.dueCount,
      newCount: nextPlan.newCount,
      refreshCount: nextPlan.refreshCount
    });
  }, []);

  const labels: Record<string, string> = {
    meaning: "Vocabulary",
    article: "Articles",
    plural: "Plurals",
    translation: "Production"
  };

  const shortLabels: Record<string, string> = {
    meaning: "meaning",
    article: "article",
    plural: "plural",
    translation: "German recall"
  };

  return (
    <main className="shell">
      <div className="header">
        <div className="brand">🇩🇪 German Learning Portal</div>
        <span className="pill">A1</span>
      </div>

      <h1 style={{ marginBottom: 6 }}>Guten Tag 👋</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Use Smart Practice for your scheduled reviews, or choose one skill to
        drill whenever you want.
      </p>

      <div className="card hero" style={{ marginTop: 22 }}>
        <div className="questionType">SMART PRACTICE</div>
        <h2 style={{ fontSize: 30, margin: "0 0 8px" }}>Up to 20 questions</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          {plan.dueCount > 0
            ? `${plan.dueCount} due review${plan.dueCount === 1 ? "" : "s"} come first.`
            : "Nothing is overdue, so the session introduces new skills."}
        </p>

        <div className="sessionMix">
          <span><strong>{plan.dueCount}</strong> due</span>
          <span><strong>{plan.newCount}</strong> new</span>
          {plan.refreshCount > 0 && (
            <span><strong>{plan.refreshCount}</strong> refresh</span>
          )}
        </div>

        <div style={{ margin: "20px 0 8px" }}>
          <div className="skillLabel">
            <span>Long-term mastery</span>
            <strong>{overview.overallMastery}%</strong>
          </div>
          <ProgressBar value={overview.overallMastery} />
        </div>

        <Link href="/practice?mode=smart">
          <button className="primaryButton" style={{ marginTop: 22 }}>
            Start Smart Practice →
          </button>
        </Link>
      </div>

      <div className="sectionTitle">Focused Practice</div>
      <p className="muted focusedPracticeIntro">
        Pick exactly what you want to train. These sessions still prioritize
        weak and due items inside the skill you choose.
      </p>
      <div className="practiceModeGrid">
        {focusedModes.map(mode => (
          <Link
            key={mode.id}
            href={`/practice?mode=${mode.id}`}
            className={`practiceModeCard ${mode.id === "mixed" ? "wide" : ""}`}
          >
            <span className="practiceModeIcon" aria-hidden="true">{mode.icon}</span>
            <div>
              <strong>{mode.label}</strong>
              <span>{mode.description}</span>
            </div>
            <span className="practiceModeArrow" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>

      <div className="stats">
        <div className="stat">
          <strong>{overview.dueNow}</strong>
          <span className="muted">Reviews due now</span>
        </div>
        <div className="stat">
          <strong>{overview.dueTomorrow}</strong>
          <span className="muted">Due tomorrow</span>
        </div>
      </div>

      <div className="reviewScheduleCard">
        <div>
          <span className="muted reviewScheduleLabel">NEXT SCHEDULED REVIEW</span>
          <strong>{formatReviewTime(overview.nextReviewAt)}</strong>
        </div>
        <div className="reviewScheduleProgress">
          {overview.learnedSkills}/{overview.totalSkills || 96} word-skills started
        </div>
      </div>

      {weakWords.length > 0 && (
        <>
          <div className="sectionTitle">Weakest word-skills</div>
          <div className="card">
            <div className="list">
              {weakWords.map(word => (
                <div className="weakWordRow" key={word.vocabId}>
                  <div>
                    <strong>{word.german}</strong>
                    <div className="muted weakWordMeaning">{word.english}</div>
                  </div>
                  <div className="weakWordMeta">
                    <strong>{word.weakestSkillScore}%</strong>
                    <span>{shortLabels[word.weakestSkill]}</span>
                    <span>{formatReviewTime(word.nextReviewAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="sectionTitle">Your skills</div>
      <div className="card">
        {skills.map(skill => (
          <div className="skillRow" key={skill.type}>
            <div className="skillLabel">
              <span>{labels[skill.type]}</span>
              <strong>{skill.attempts ? `${skill.score}%` : "New"}</strong>
            </div>
            <ProgressBar value={skill.score} />
          </div>
        ))}
      </div>

      <p className="muted center" style={{ marginTop: 28 }}>
        {attempts} answers recorded • your existing progress stays intact.
      </p>
    </main>
  );
}
