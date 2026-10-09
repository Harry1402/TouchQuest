"use client";

import React from "react";
import {
  X,
  Flame,
  Clock,
  BookOpen,
  Download,
  Trash2,
  Calendar,
  Compass,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { QuestLog, UserStats } from "@/types/quest";
import { exportJournalAsMarkdown } from "@/lib/storage";

interface JournalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  history: QuestLog[];
  onClearHistory: () => void;
}

export function JournalDrawer({
  isOpen,
  onClose,
  stats,
  history,
  onClearHistory,
}: JournalDrawerProps) {
  if (!isOpen) return null;

  const handleDownloadMarkdown = () => {
    const md = exportJournalAsMarkdown(history);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `touchquest-journal-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-md flex-col bg-[#FBF9F4] shadow-2xl border-l border-[#E6DFD3] animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6DFD3] px-6 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#244836]" />
            <h2 className="font-serif text-lg font-bold text-[#1C2720]">
              Nature Field Log
            </h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-full p-1.5 text-[#667269] hover:bg-[#EAE3D2] transition"
            aria-label="Close Journal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stats summary bar */}
        <div className="grid grid-cols-3 gap-2 border-b border-[#E6DFD3] bg-white p-4 text-center">
          <div className="rounded-xl bg-[#F8F5EE] p-2.5">
            <div className="flex items-center justify-center gap-1 text-amber-600">
              <Flame className="h-4 w-4 fill-amber-500" />
              <span className="font-mono text-lg font-bold">{stats.currentStreak}</span>
            </div>
            <span className="text-[11px] font-medium text-[#667269]">Day Streak</span>
          </div>

          <div className="rounded-xl bg-[#F8F5EE] p-2.5">
            <div className="flex items-center justify-center gap-1 text-[#244836]">
              <Clock className="h-4 w-4" />
              <span className="font-mono text-lg font-bold">{stats.totalOutdoorMinutes}</span>
            </div>
            <span className="text-[11px] font-medium text-[#667269]">Mins Outside</span>
          </div>

          <div className="rounded-xl bg-[#F8F5EE] p-2.5">
            <div className="flex items-center justify-center gap-1 text-[#244836]">
              <Sparkles className="h-4 w-4" />
              <span className="font-mono text-lg font-bold">
                {stats.totalMissionsCompleted}
              </span>
            </div>
            <span className="text-[11px] font-medium text-[#667269]">Missions</span>
          </div>
        </div>

        {/* History list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-[#8C988F]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFE9DC] text-[#244836]">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-serif text-base font-semibold text-[#1C2720]">
                No nature entries yet
              </h3>
              <p className="mt-1 text-xs max-w-xs text-[#667269]">
                Complete your first mission to track your outdoor moments and mindful reflections.
              </p>
            </div>
          ) : (
            history.map((log) => {
              const formattedDate = new Date(log.completedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              });
              const mins = Math.max(1, Math.round(log.durationSeconds / 60));

              return (
                <div
                  key={log.id}
                  className="rounded-2xl border border-[#E6DFD3] bg-white p-4 shadow-2xs"
                >
                  <div className="flex items-center justify-between text-xs text-[#667269]">
                    <span className="flex items-center gap-1 font-medium capitalize">
                      <Compass className="h-3.5 w-3.5 text-[#244836]" />
                      {log.environment}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formattedDate} • {mins}m
                    </span>
                  </div>

                  <h3 className="mt-2 font-serif text-base font-bold text-[#1C2720]">
                    {log.title}
                  </h3>

                  {/* Mood Shift */}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F4EFE6] px-2.5 py-0.5 text-xs text-[#5D6B60]">
                      <span>Mood: {log.preMoodRating}/5</span>
                      <ArrowRight className="h-3 w-3 text-[#244836]" />
                      <span className="font-semibold text-[#244836]">
                        {log.postMoodRating}/5
                      </span>
                    </span>
                    {log.completionStatus && (
                      <span className="inline-flex items-center rounded-full bg-[#F4EFE6] px-2.5 py-0.5 text-xs capitalize text-[#5D6B60]">
                        {log.completionStatus === "completed" ? "✅" : log.completionStatus === "partial" ? "🔶" : "⏸️"}{" "}
                        {log.completionStatus}
                      </span>
                    )}
                    {log.relevanceRating != null && (
                      <span className="inline-flex items-center rounded-full bg-[#F4EFE6] px-2.5 py-0.5 text-xs text-[#5D6B60]">
                        Fit: {log.relevanceRating}/5
                      </span>
                    )}
                  </div>

                  {/* Reflection quote */}
                  {log.reflectionText && (
                    <blockquote className="mt-2.5 rounded-xl bg-[#FBF9F4] p-2.5 text-xs italic text-[#445247] border-l-2 border-[#244836]">
                      &ldquo;{log.reflectionText}&rdquo;
                    </blockquote>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        {history.length > 0 && (
          <div className="border-t border-[#E6DFD3] bg-white p-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 rounded-xl border border-[#E6DFD3] bg-[#FBF9F4] px-3.5 py-2 text-xs font-semibold text-[#1C2720] hover:bg-[#F2ECE1] transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-[#244836]" />
              <span>Export Markdown</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm("Clear all field log history?")) {
                  onClearHistory();
                }
              }}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear Log</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
