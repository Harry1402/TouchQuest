"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Sparkles, Check } from "lucide-react";
import { Quest, QuestLog, CompletionStatus } from "@/types/quest";

interface ReflectionModalProps {
  quest: Quest;
  elapsedSeconds: number;
  onSave: (log: Omit<QuestLog, "id">) => void;
  onClose: () => void;
}

const MOOD_LEVELS = [
  { value: 1, label: "Tense / Foggy", emoji: "😣" },
  { value: 2, label: "Scattered", emoji: "😐" },
  { value: 3, label: "Neutral", emoji: "🙂" },
  { value: 4, label: "Calm / Clear", emoji: "🌿" },
  { value: 5, label: "Deeply Grounded", emoji: "✨" },
];

const COMPLETION_OPTIONS: { value: CompletionStatus; label: string; emoji: string }[] = [
  { value: "completed", label: "Completed fully", emoji: "✅" },
  { value: "partial", label: "Partial", emoji: "🔶" },
  { value: "interrupted", label: "Interrupted", emoji: "⏸️" },
];

const RELEVANCE_OPTIONS = [
  { value: 1, label: "Poor fit" },
  { value: 2, label: "Meh" },
  { value: 3, label: "OK" },
  { value: 4, label: "Good" },
  { value: 5, label: "Spot on" },
];

export function ReflectionModal({
  quest,
  elapsedSeconds,
  onSave,
  onClose,
}: ReflectionModalProps) {
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus>("completed");
  const [relevance, setRelevance] = useState<number>(3);
  const [preMood, setPreMood] = useState<number>(2);
  const [postMood, setPostMood] = useState<number>(4);
  const [reflection, setReflection] = useState<string>("");
  const [aiMissed, setAiMissed] = useState<string>("");

  useEffect(() => {
    // Fire festive mindful confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#244836", "#4E9367", "#88C69D", "#BC683D", "#F4EFE6"],
      });
    } catch {
      // Ignored if canvas not ready
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      questId: quest.id,
      title: quest.title,
      tagline: quest.tagline,
      environment: quest.environment,
      completedAt: new Date().toISOString(),
      durationSeconds: elapsedSeconds,
      plannedMinutes: quest.durationMinutes,
      reflectionText: reflection.trim(),
      preMoodRating: preMood,
      postMoodRating: postMood,
      completionStatus,
      relevanceRating: relevance,
      aiMissedReflection: aiMissed.trim() || undefined,
    });
  };

  const minutesSpent = Math.max(1, Math.round(elapsedSeconds / 60));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl border border-[#E6DFD3] bg-[#FBF9F4] p-6 shadow-2xl sm:p-8 my-auto">
        <div className="text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8EDE3] text-[#244836]">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight text-[#1C2720]">
            Mission Completed
          </h2>
          <p className="mt-1 text-sm text-[#667269]">
            You spent <strong className="text-[#244836]">{minutesSpent} mindful minutes</strong> outside.
          </p>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {/* Q1: Completion status */}
          <div className="rounded-2xl border border-[#E6DFD3] bg-white p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#667269] mb-2">
              Did you complete the mission?
            </h3>
            <div className="flex gap-2">
              {COMPLETION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCompletionStatus(opt.value)}
                  className={`flex-1 flex flex-col items-center gap-1 rounded-xl py-2.5 text-xs font-medium transition active:scale-95 border ${
                    completionStatus === opt.value
                      ? "border-[#244836] bg-[#F3F7F2] ring-1 ring-[#244836] font-bold"
                      : "border-[#E6DFD3] bg-[#FBF9F4] hover:bg-[#F4EFE6]"
                  }`}
                >
                  <span className="text-base">{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Q2: Relevance of quest to surroundings */}
          <div className="rounded-2xl border border-[#E6DFD3] bg-white p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#667269] mb-2">
              How relevant was it to your outdoor spot?
            </h3>
            <div className="flex gap-1.5">
              {RELEVANCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRelevance(opt.value)}
                  className={`flex-1 flex flex-col items-center gap-0.5 rounded-xl py-2 text-xs transition active:scale-90 border ${
                    relevance === opt.value
                      ? "border-[#244836] bg-[#F3F7F2] ring-1 ring-[#244836] font-bold"
                      : "border-[#E6DFD3] bg-[#FBF9F4] opacity-60 hover:opacity-100"
                  }`}
                >
                  <span className="text-sm font-bold tabular-nums">{opt.value}</span>
                  <span className="text-[10px] text-[#667269]">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Q3: Mood Shift Comparison */}
          <div className="rounded-2xl border border-[#E6DFD3] bg-white p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#667269] text-center mb-3">
              How did your state of mind shift?
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Before */}
              <div>
                <span className="block text-xs font-semibold text-[#8C988F] mb-1.5">
                  Before quest:
                </span>
                <div className="flex justify-between gap-1">
                  {MOOD_LEVELS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setPreMood(m.value)}
                      className={`flex flex-col items-center justify-center rounded-xl p-1.5 text-xs transition active:scale-90 ${
                        preMood === m.value
                          ? "bg-[#F3F7F2] ring-2 ring-[#244836] font-bold"
                          : "opacity-60 hover:opacity-100"
                      }`}
                      title={m.label}
                    >
                      <span className="text-base">{m.emoji}</span>
                      <span className="text-[10px] text-[#667269]">{m.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* After */}
              <div>
                <span className="block text-xs font-semibold text-[#244836] mb-1.5">
                  After quest:
                </span>
                <div className="flex justify-between gap-1">
                  {MOOD_LEVELS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setPostMood(m.value)}
                      className={`flex flex-col items-center justify-center rounded-xl p-1.5 text-xs transition active:scale-90 ${
                        postMood === m.value
                          ? "bg-[#E8EDE3] ring-2 ring-[#244836] font-bold"
                          : "opacity-60 hover:opacity-100"
                      }`}
                      title={m.label}
                    >
                      <span className="text-base">{m.emoji}</span>
                      <span className="text-[10px] text-[#244836]">{m.value}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Q4: Prompt & Reflection note */}
          <div className="rounded-2xl border border-[#E6DFD3] bg-white p-4">
            <label
              htmlFor="reflectionText"
              className="block text-xs font-bold uppercase tracking-wider text-[#667269] mb-1"
            >
              Quick Reflection (optional)
            </label>
            <p className="text-sm font-medium italic text-[#244836] mb-2.5">
              &ldquo;{quest.reflectionPrompt}&rdquo;
            </p>
            <textarea
              id="reflectionText"
              rows={2}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="One thought, sound, or feeling you noticed..."
              className="w-full rounded-xl border border-[#E6DFD3] bg-[#FBF9F4] p-3 text-sm text-[#1C2720] placeholder-[#9CA79E] transition focus:border-[#244836] focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Q5: What did you notice that the AI missed? */}
          <div className="rounded-2xl border border-[#D5E2D8] bg-[#F1F7F3] p-4">
            <label
              htmlFor="aiMissedText"
              className="block text-xs font-bold uppercase tracking-wider text-[#244836] mb-1"
            >
              Beyond the Model
            </label>
            <p className="text-sm font-semibold text-[#1C2720] mb-2">
              What did you notice that the AI missed?
            </p>
            <input
              id="aiMissedText"
              type="text"
              value={aiMissed}
              onChange={(e) => setAiMissed(e.target.value)}
              placeholder="e.g. The cool breeze from the creek, a small bird in the high branches..."
              className="w-full rounded-xl border border-[#D5E2D8] bg-white p-2.5 text-xs text-[#1C2720] placeholder-[#8A988E] transition focus:border-[#244836] focus:outline-hidden"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-[#E6DFD3] bg-[#F4EFE6] py-3 text-sm font-medium text-[#667269] transition hover:bg-[#EAE4D7] cursor-pointer"
            >
              Skip
            </button>
            <button
              type="submit"
              className="flex-2 flex items-center justify-center gap-2 rounded-2xl bg-[#244836] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#1B382A] active:scale-95 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Save Feedback</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
