"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { QuestForm } from "@/components/QuestForm";
import { QuestDisplay } from "@/components/QuestDisplay";
import { QuestMode } from "@/components/QuestMode";
import { ReflectionModal } from "@/components/ReflectionModal";
import { JournalDrawer } from "@/components/JournalDrawer";
import {
  Quest,
  QuestPreference,
  QuestLog,
  UserStats,
  QUICK_START_PREFERENCE,
} from "@/types/quest";
import { getStats, getHistory, saveQuestCompletion } from "@/lib/storage";
import {
  ShieldAlert,
  Trees,
  Cpu,
  Zap,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

export default function Home() {
  const [quest, setQuest] = useState<Quest | null>(null);
  const [viewState, setViewState] = useState<"form" | "display" | "questing">("form");
  const [showReflection, setShowReflection] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isJournalOpen, setIsJournalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isQuickStartLoading, setIsQuickStartLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustomForm, setShowCustomForm] = useState<boolean>(false);

  const [stats, setStats] = useState<UserStats>({
    totalMissionsCompleted: 0,
    totalOutdoorMinutes: 0,
    currentStreak: 0,
    lastCompletedDate: null,
  });
  const [history, setHistory] = useState<QuestLog[]>([]);

  // Load stats and history on mount asynchronously to prevent cascading render
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats(getStats());
      setHistory(getHistory());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const fetchQuest = async (
    preferences: QuestPreference,
    setLoadingFn: (v: boolean) => void
  ) => {
    setLoadingFn(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.quest) {
        throw new Error(data.error || "Failed to generate quest");
      }

      setQuest(data.quest);
      setViewState("display");
    } catch (err: unknown) {
      console.error("Quest generation error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while contacting Gemma."
      );
    } finally {
      setLoadingFn(false);
    }
  };

  const handleQuickStart = () => {
    fetchQuest(QUICK_START_PREFERENCE, setIsQuickStartLoading);
  };

  const handleGenerateQuest = async (preferences: QuestPreference) => {
    await fetchQuest(preferences, setIsLoading);
  };

  const handleStartQuest = () => {
    setViewState("questing");
  };

  const handleCompleteQuest = (seconds: number) => {
    setElapsedSeconds(seconds);
    setViewState("display");
    setShowReflection(true);
  };

  const handleCancelQuestMode = () => {
    setViewState("display");
  };

  const handleSaveReflection = (logData: Omit<QuestLog, "id">) => {
    const { newStats, savedLog } = saveQuestCompletion(logData);
    setStats(newStats);
    setHistory((prev) => [savedLog, ...prev]);
    setShowReflection(false);
    setViewState("form");
    setQuest(null);
  };

  const handleClearHistory = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("touchquest_history");
      localStorage.removeItem("touchquest_stats");
      setStats({
        totalMissionsCompleted: 0,
        totalOutdoorMinutes: 0,
        currentStreak: 0,
        lastCompletedDate: null,
      });
      setHistory([]);
    }
  };

  const anyLoading = isLoading || isQuickStartLoading;

  return (
    <div className="flex min-h-screen flex-col bg-[#FBF9F4] text-[#1C2720]">
      {/* Sticky Header */}
      <Header stats={stats} onOpenJournal={() => setIsJournalOpen(true)} />

      {/* Main Content Area */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6">
        {/* Error notification banner */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <ShieldAlert className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1">
              <strong className="block font-semibold">Generation Notice</strong>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs font-semibold underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View Routing */}
        {viewState === "form" && (
          <div className="space-y-6">
            {/* Minimalist Hero */}
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D5E2D8] bg-[#F1F7F3] px-3 py-1 text-xs font-semibold text-[#244836]">
                <Trees className="h-3.5 w-3.5 text-[#244836]" />
                <span>Hacktoberfest 2026 Open-Source AI Challenge</span>
              </div>
              <h1 className="mt-3 font-serif text-3xl font-extrabold tracking-tight text-[#1C2720] sm:text-4xl">
                Close your tabs. Touch grass.
              </h1>
              <p className="mt-2 text-base text-[#606D63] max-w-xl">
                Spent hours on screens? Get a practical, mindful outdoor mission in one tap.
                Listen to the audio briefing, pocket your phone, and reconnect.
              </p>
            </div>

            {/* ⚡ Quick Start CTA */}
            <div className="rounded-3xl border-2 border-[#244836] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-4">
                <div className="flex-1">
                  <h2 className="font-serif text-xl font-bold tracking-tight text-[#1C2720] sm:text-2xl">
                    Ready for a screen break?
                  </h2>
                  <p className="mt-1 text-sm text-[#667269]">
                    1-tap 5-minute outdoor reset. Suitable for any nearby sidewalk, bench, or window.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickStart}
                  disabled={anyLoading}
                  className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-[#244836] px-6 py-3.5 font-serif text-base font-semibold text-white shadow-md transition hover:bg-[#1B382A] active:scale-[0.98] disabled:opacity-70 cursor-pointer"
                >
                  {isQuickStartLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      <span>Get me outside now</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Collapsible Custom Quest Builder */}
            <div>
              <button
                type="button"
                onClick={() => setShowCustomForm(!showCustomForm)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E6DFD3] bg-[#F7F4EC] px-4 py-3 text-sm font-medium text-[#4C584E] transition hover:bg-[#EFE9DC] cursor-pointer"
              >
                <span>Or customize your quest</span>
                {showCustomForm ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showCustomForm && (
                <div className="mt-4">
                  <QuestForm onGenerate={handleGenerateQuest} isLoading={isLoading} />
                </div>
              )}
            </div>
          </div>
        )}

        {viewState === "display" && quest && (
          <QuestDisplay
            quest={quest}
            onStartQuest={handleStartQuest}
            onBackToEdit={() => setViewState("form")}
          />
        )}

        {/* Active Phone-Down Quest Mode */}
        {viewState === "questing" && quest && (
          <QuestMode
            quest={quest}
            onComplete={handleCompleteQuest}
            onCancel={handleCancelQuestMode}
          />
        )}

        {/* Reflection Modal */}
        {showReflection && quest && (
          <ReflectionModal
            quest={quest}
            elapsedSeconds={elapsedSeconds}
            onSave={handleSaveReflection}
            onClose={() => {
              setShowReflection(false);
              setViewState("form");
              setQuest(null);
            }}
          />
        )}

        {/* Field Log Drawer */}
        <JournalDrawer
          isOpen={isJournalOpen}
          onClose={() => setIsJournalOpen(false)}
          stats={stats}
          history={history}
          onClearHistory={handleClearHistory}
        />
      </main>

      {/* Earthy Minimal Footer */}
      <footer className="mt-auto border-t border-[#E6DFD3] bg-[#F7F4EC] py-6 text-xs text-[#667269]">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:text-left">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 font-medium text-[#1C2720]">
              <Trees className="h-4 w-4 text-[#244836]" />
              <span>TouchQuest • Open Source Nature Companion</span>
            </div>
            <p className="mt-0.5 text-[11px] text-[#7A867D]">
              Built with Google Gemma 2 open weights, Next.js, and privacy-first local storage.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1 text-[#244836]">
              <Cpu className="h-3.5 w-3.5" />
              <span>Gemma 2 Powered</span>
            </span>
            <span className="text-[#A4B0A7]">•</span>
            <span>Zero PII Tracking</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
