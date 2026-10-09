"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Pause,
  Play,
  CheckCircle,
  X,
  Volume2,
  VolumeX,
  Plus,
  Compass,
  HandMetal,
  Leaf,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Quest } from "@/types/quest";
import { playMindfulChime } from "@/lib/sound";
import { speakQuest, stopSpeech, isSpeechSupported } from "@/lib/speech";

interface QuestModeProps {
  quest: Quest;
  onComplete: (elapsedSeconds: number) => void;
  onCancel: () => void;
}

export function QuestMode({ quest, onComplete, onCancel }: QuestModeProps) {
  const initialSeconds = quest.durationMinutes * 60;
  const [totalSeconds, setTotalSeconds] = useState<number>(initialSeconds);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const speechAvailable = isSpeechSupported();

  const chimePlayedRef = useRef<boolean>(false);

  // Initial bell chime on quest start
  useEffect(() => {
    playMindfulChime();
  }, []);

  // Timer interval
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (!chimePlayedRef.current) {
            playMindfulChime();
            chimePlayedRef.current = true;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakQuest(
        quest,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }
  };

  const handleAddFiveMinutes = () => {
    setRemainingSeconds((prev) => prev + 300);
    setTotalSeconds((prev) => prev + 300);
  };

  const handleFinish = () => {
    stopSpeech();
    playMindfulChime();
    const elapsed = Math.max(15, totalSeconds - remainingSeconds);
    onComplete(elapsed);
  };

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const progressPct = Math.min(
    100,
    Math.max(0, ((totalSeconds - remainingSeconds) / totalSeconds) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#15271E] text-[#EDF4EE] px-5 py-6 sm:px-8 sm:py-8 select-none">
      {/* Top Bar */}
      <div className="mx-auto flex w-full max-w-xl items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#96B3A0]">
          <Leaf className="h-4 w-4 text-[#7BB88E]" />
          <span>Phone-Down Mode</span>
        </div>

        <div className="flex items-center gap-2">
          {speechAvailable && (
            <button
              onClick={handleToggleSpeech}
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#20392B] text-[#CFE2D4] transition hover:bg-[#2C4F3B]"
              aria-label="Toggle spoken audio"
            >
              {isSpeaking ? (
                <VolumeX className="h-4 w-4 text-amber-300" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
          )}

          <button
            onClick={() => {
              stopSpeech();
              onCancel();
            }}
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#20392B] text-[#CFE2D4] transition hover:bg-[#2C4F3B]"
            aria-label="Exit Quest Mode"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Center: Minimalist Timer & Anchor */}
      <div className="mx-auto my-auto flex w-full max-w-md flex-col items-center text-center">
        {/* Subtle pulsing badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#2E4F3D] bg-[#1E372A] px-4 py-1.5 text-xs text-[#BED7C5]">
          <Compass className="h-3.5 w-3.5 text-[#7EB892]" />
          <span>{quest.title}</span>
        </div>

        {/* Large Timer Display */}
        <div className="mt-8 font-mono text-7xl font-extralight tracking-tight sm:text-8xl tabular-nums text-white">
          {formattedTime}
        </div>

        {/* Progress bar */}
        <div className="mt-6 h-1.5 w-64 rounded-full bg-[#223F30] overflow-hidden">
          <div
            className="h-full bg-[#6BB583] transition-all duration-1000 ease-linear"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <p className="mt-4 text-xs font-medium tracking-wide text-[#8DAA96]">
          {remainingSeconds === 0
            ? "Mission time reached! Complete your quest whenever ready."
            : "Pocket your phone. Let your senses guide you."}
        </p>

        {/* Current Step Snippet Carousel */}
        <div className="mt-8 w-full rounded-2xl border border-[#294A38] bg-[#1A3326]/80 p-4 text-left shadow-lg">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#7FB492]">
            <span>
              Step {currentStepIndex + 1} of {quest.steps.length}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() =>
                  setCurrentStepIndex((prev) => Math.max(0, prev - 1))
                }
                disabled={currentStepIndex === 0}
                className="p-1 text-[#8DAA96] hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentStepIndex((prev) =>
                    Math.min(quest.steps.length - 1, prev + 1)
                  )
                }
                disabled={currentStepIndex === quest.steps.length - 1}
                className="p-1 text-[#8DAA96] hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-[#E2ECE4] leading-relaxed">
            {quest.steps[currentStepIndex]}
          </p>

          <div className="mt-3 flex items-center gap-1.5 border-t border-[#274836] pt-2.5 text-xs text-[#9EBDAA]">
            <HandMetal className="h-3.5 w-3.5 text-[#88C69D] shrink-0" />
            <span className="truncate">{quest.sensoryAnchor}</span>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="mx-auto flex w-full max-w-sm items-center justify-center gap-4">
        {/* Play/Pause */}
        <button
          type="button"
          onClick={() => setIsRunning(!isRunning)}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-[#2D503C] bg-[#1E372A] text-white transition hover:bg-[#284937] active:scale-95 cursor-pointer"
          aria-label={isRunning ? "Pause Timer" : "Resume Timer"}
        >
          {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-white" />}
        </button>

        {/* Add 5 min */}
        <button
          type="button"
          onClick={handleAddFiveMinutes}
          className="flex h-12 items-center gap-1.5 rounded-full border border-[#2D503C] bg-[#1E372A] px-4 text-xs font-semibold text-[#CFE2D4] transition hover:bg-[#284937] active:scale-95 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>+5 min</span>
        </button>

        {/* Complete Mission */}
        <button
          type="button"
          onClick={handleFinish}
          className="flex h-14 items-center gap-2 rounded-full bg-[#4E9367] px-6 font-serif text-sm font-semibold text-white shadow-lg transition hover:bg-[#5AA775] active:scale-95 cursor-pointer"
        >
          <CheckCircle className="h-5 w-5" />
          <span>Mission Done</span>
        </button>
      </div>
    </div>
  );
}
