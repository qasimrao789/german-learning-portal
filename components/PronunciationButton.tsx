"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type PronunciationVariant = "full" | "word";
type AudioState = "idle" | "loading" | "playing" | "error";

let activeAudio: HTMLAudioElement | null = null;
let activeReset: (() => void) | null = null;

function audioStem(vocabId: string) {
  return vocabId
    .trim()
    .toLowerCase()
    .replace(/:/g, "--")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function audioUrl(vocabId: string, variant: PronunciationVariant) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${basePath}/audio/vocabulary/${audioStem(vocabId)}-${variant}.mp3`;
}

export default function PronunciationButton({
  vocabId,
  text,
  variant = "full",
  compact = false
}: {
  vocabId: string;
  text: string;
  variant?: PronunciationVariant;
  compact?: boolean;
}) {
  const [state, setState] = useState<AudioState>("idle");
  const src = useMemo(() => audioUrl(vocabId, variant), [vocabId, variant]);

  const resetState = useCallback(() => setState("idle"), []);

  useEffect(() => {
    return () => {
      if (activeReset !== resetState) return;
      activeAudio?.pause();
      activeAudio = null;
      activeReset = null;
    };
  }, [resetState]);

  const play = async () => {
    if (state === "loading") return;

    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio = null;
      activeReset?.();
      activeReset = null;
    }

    const audio = new Audio(src);
    activeAudio = audio;
    activeReset = resetState;
    setState("loading");

    const finish = () => {
      if (activeAudio === audio) activeAudio = null;
      if (activeReset === resetState) activeReset = null;
      setState("idle");
    };

    audio.addEventListener("playing", () => setState("playing"), { once: true });
    audio.addEventListener("ended", finish, { once: true });
    audio.addEventListener(
      "error",
      () => {
        if (activeAudio === audio) activeAudio = null;
        if (activeReset === resetState) activeReset = null;
        setState("error");
      },
      { once: true }
    );

    try {
      await audio.play();
    } catch {
      if (activeAudio === audio) activeAudio = null;
      if (activeReset === resetState) activeReset = null;
      setState("error");
    }
  };

  const label =
    state === "error"
      ? `Pronunciation audio unavailable for ${text}`
      : `Play German pronunciation: ${text}`;

  return (
    <button
      type="button"
      className={`pronunciationButton ${compact ? "compact" : ""} ${state}`}
      aria-label={label}
      title={
        state === "error"
          ? "Audio file not found. Run npm run audio:generate locally."
          : `Play pronunciation: ${text}`
      }
      onClick={play}
    >
      <span aria-hidden="true">{state === "playing" ? "🔉" : state === "error" ? "!" : "🔊"}</span>
    </button>
  );
}
