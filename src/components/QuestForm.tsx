"use client";

import React, { useState } from "react";
import {
  Trees,
  Home,
  Mountain,
  Footprints,
  Waves,
  Sparkles,
  Compass,
  Eye,
  Volume2,
  Wind,
  Smile,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import {
  EnvironmentType,
  EnergyLevel,
  QuestType,
  QuestPreference,
  EnvironmentOptions,
  EnergyOptions,
  QuestTypeOptions,
} from "@/types/quest";

interface QuestFormProps {
  onGenerate: (pref: QuestPreference) => Promise<void>;
  isLoading: boolean;
}

const DURATION_CHOICES = [5, 10, 15, 20, 30, 45];

export function QuestForm({ onGenerate, isLoading }: QuestFormProps) {
  const [duration, setDuration] = useState<number>(15);
  const [environment, setEnvironment] = useState<EnvironmentType>("park");
  const [energy, setEnergy] = useState<EnergyLevel>("gentle");
  const [questType, setQuestType] = useState<QuestType>("sensory");
  const [customContext, setCustomContext] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      durationMinutes: duration,
      environment,
      energyLevel: energy,
      questType,
      customContext: customContext.trim(),
    });
  };

  const getEnvIcon = (id: EnvironmentType) => {
    switch (id) {
      case "park":
        return <Trees className="h-5 w-5 text-[#244836]" />;
      case "balcony":
        return <Home className="h-5 w-5 text-[#8D6B4F]" />;
      case "forest":
        return <Mountain className="h-5 w-5 text-[#3E5C46]" />;
      case "neighborhood":
        return <Footprints className="h-5 w-5 text-[#6D776C]" />;
      case "water":
        return <Waves className="h-5 w-5 text-[#3A7276]" />;
    }
  };

  const getQuestTypeIcon = (id: QuestType) => {
    switch (id) {
      case "sensory":
        return <Wind className="h-4 w-4" />;
      case "scavenger":
        return <Eye className="h-4 w-4" />;
      case "micro_wonder":
        return <Compass className="h-4 w-4" />;
      case "sound_safari":
        return <Volume2 className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full rounded-3xl border border-[#E6DFD3] bg-white p-5 shadow-xs sm:p-7">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8EDE3] px-3 py-1 text-xs font-semibold text-[#244836]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Tailor Your Nature Mission</span>
        </div>
        <h2 className="mt-2.5 font-serif text-2xl font-bold tracking-tight text-[#1C2720] sm:text-3xl">
          Where will you touch grass today?
        </h2>
        <p className="mt-1 text-sm text-[#667269]">
          Select your surroundings and pace. Gemma AI crafts a focused, tactile mission you can do right now.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Available Time */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#667269]">
            1. Available Time
          </label>
          <div className="mt-2 grid grid-cols-6 gap-2">
            {DURATION_CHOICES.map((m) => {
              const active = duration === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDuration(m)}
                  className={`flex flex-col items-center justify-center rounded-xl border py-2.5 text-xs font-medium transition active:scale-95 ${
                    active
                      ? "border-[#244836] bg-[#244836] text-white shadow-xs font-semibold"
                      : "border-[#E6DFD3] bg-[#FBF9F4] text-[#1C2720] hover:bg-[#F2ECE1]"
                  }`}
                >
                  <span className="text-base font-bold">{m}</span>
                  <span className="text-[10px] opacity-80">min</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Environment Setting */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#667269]">
            2. Current Environment
          </label>
          <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {EnvironmentOptions.map((opt) => {
              const active = environment === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setEnvironment(opt.id)}
                  className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition active:scale-[0.98] ${
                    active
                      ? "border-[#244836] bg-[#F3F7F2] ring-1 ring-[#244836]"
                      : "border-[#E6DFD3] bg-[#FBF9F4] hover:bg-[#F4EFE6]"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-2xs border border-[#E6DFD3]/60">
                    {getEnvIcon(opt.id)}
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-[#1C2720]">
                      {opt.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Energy & Tempo */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#667269]">
            3. Energy & Tempo
          </label>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {EnergyOptions.map((opt) => {
              const active = energy === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setEnergy(opt.id)}
                  className={`rounded-2xl border p-3 text-left transition active:scale-[0.98] ${
                    active
                      ? "border-[#244836] bg-[#F3F7F2] ring-1 ring-[#244836]"
                      : "border-[#E6DFD3] bg-[#FBF9F4] hover:bg-[#F4EFE6]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#1C2720]">{opt.label}</span>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        active ? "bg-[#244836]" : "bg-[#D8D2C5]"
                      }`}
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-[#667269]">{opt.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quest Focus / Type */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#667269]">
            4. Quest Style
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {QuestTypeOptions.map((opt) => {
              const active = questType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setQuestType(opt.id)}
                  className={`flex flex-col items-start rounded-2xl border p-2.5 text-left transition active:scale-[0.98] ${
                    active
                      ? "border-[#244836] bg-[#F3F7F2] ring-1 ring-[#244836]"
                      : "border-[#E6DFD3] bg-[#FBF9F4] hover:bg-[#F4EFE6]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1C2720]">
                    <span className="text-[#244836]">{getQuestTypeIcon(opt.id)}</span>
                    <span>{opt.label}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#667269] line-clamp-2">
                    {opt.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Context / Mood note (Optional) */}
        <div>
          <label
            htmlFor="customContext"
            className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#667269]"
          >
            <span className="flex items-center gap-1">
              <Smile className="h-3.5 w-3.5 text-[#244836]" />
              5. Optional Mood or Specific Context
            </span>
            <span className="text-[10px] lowercase font-normal text-[#8A958D]">
              optional (max 100 chars)
            </span>
          </label>
          <div className="mt-1.5">
            <input
              id="customContext"
              type="text"
              maxLength={100}
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              placeholder="e.g. Spent all morning writing code, feeling mental brain fog"
              className="w-full rounded-xl border border-[#E6DFD3] bg-[#FBF9F4] px-3.5 py-2.5 text-sm text-[#1C2720] placeholder-[#9CA79E] transition focus:border-[#244836] focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Safety & Open-Source Guarantee pill */}
        <div className="flex items-center gap-2 rounded-xl bg-[#F7F4EC] p-3 text-xs text-[#5D6B60]">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[#244836]" />
          <span>
            Strict safety rules applied. No trespassing, no road crossing, and zero wildlife or wild plant ingestion.
          </span>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#244836] py-3.5 px-6 font-serif text-base font-semibold text-[#FBF9F4] shadow-md transition hover:bg-[#1B382A] active:scale-[0.99] disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Weaving Outdoor Mission...</span>
              </>
            ) : (
              <>
                <Compass className="h-5 w-5" />
                <span>Craft My Nature Quest</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
