"use client";

import React from "react";
import { Trees, Flame, Clock, BookOpen } from "lucide-react";
import { UserStats } from "@/types/quest";

interface HeaderProps {
  stats: UserStats;
  onOpenJournal: () => void;
}

export function Header({ stats, onOpenJournal }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#E6DFD3] bg-[#FBF9F4]/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#244836] text-[#FBF9F4] shadow-sm">
            <Trees className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-lg font-bold tracking-tight text-[#1C2720] sm:text-xl">
                TouchQuest
              </span>
              <span className="rounded-full bg-[#E8EDE3] px-2 py-0.5 text-[10px] font-semibold text-[#244836]">
                Week 1 • Touch Grass
              </span>
            </div>
            <p className="text-[11px] text-[#667269]">
              Mindful outdoor missions powered by Gemma AI
            </p>
          </div>
        </div>

        {/* Stats & Journal Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak Badge */}
          <div
            title="Consecutive daily nature streak"
            className="flex items-center gap-1 rounded-full border border-[#E6DFD3] bg-white px-2.5 py-1 text-xs font-medium text-[#1C2720] shadow-2xs"
          >
            <Flame
              className={`h-3.5 w-3.5 ${
                stats.currentStreak > 0 ? "fill-amber-500 text-amber-500" : "text-[#8C988F]"
              }`}
            />
            <span className="tabular-nums font-semibold">{stats.currentStreak}</span>
            <span className="hidden sm:inline text-[#667269]">streak</span>
          </div>

          {/* Minutes Badge */}
          <div
            title="Total minutes spent outside"
            className="hidden sm:flex items-center gap-1 rounded-full border border-[#E6DFD3] bg-white px-2.5 py-1 text-xs font-medium text-[#1C2720] shadow-2xs"
          >
            <Clock className="h-3.5 w-3.5 text-[#244836]" />
            <span className="tabular-nums font-semibold">{stats.totalOutdoorMinutes}</span>
            <span className="text-[#667269]">mins</span>
          </div>

          {/* Journal Button */}
          <button
            onClick={onOpenJournal}
            type="button"
            className="flex items-center gap-1.5 rounded-full bg-[#244836] px-3 py-1.5 text-xs font-medium text-[#FBF9F4] shadow-sm transition hover:bg-[#1B382A] active:scale-95"
            aria-label="Open Field Log Journal"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Field Log</span>
            {stats.totalMissionsCompleted > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#38654D] text-[10px]">
                {stats.totalMissionsCompleted}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
