"use client";

import React, { useState } from "react";
import {
  Volume2,
  VolumeX,
  ArrowLeft,
  Clock,
  Compass,
  HandMetal,
  Shield,
  HelpCircle,
  Smartphone,
  Cpu,
  Wifi,
  WifiOff,
  Info,
  SlidersHorizontal,
  Camera,
  Eye,
} from "lucide-react";
import { Quest } from "@/types/quest";
import { speakQuest, stopSpeech, isSpeechSupported } from "@/lib/speech";
import { VoiceSettingsModal } from "./VoiceSettingsModal";

interface QuestDisplayProps {
  quest: Quest;
  onStartQuest: () => void;
  onBackToEdit: () => void;
}

function ProviderBadge({ quest }: { quest: Quest }) {
  if (quest.isSample) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DCD5C6] bg-[#F4EFE6] px-3 py-1 text-xs font-medium text-[#685D4F]">
        <WifiOff className="h-3 w-3" />
        Curated Sample Mode (offline fallback)
      </span>
    );
  }

  const isLocalVision = quest.providerUsed === "gemma-local-vision";
  const isCloudVision = quest.providerUsed === "gemma-cloud-vision";
  const isLocal = quest.providerUsed === "gemma-local" || isLocalVision;
  const latency = quest.generationLatencyMs;
  const model = quest.modelName || "gemma2";

  if (isLocalVision || isCloudVision) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#CDE1D4] bg-[#EBF4EE] px-3 py-1 text-xs font-semibold text-[#244836]">
        <Camera className="h-3 w-3" />
        {isLocalVision
          ? `Local Gemma Vision (${model}) • on-device`
          : `Hosted Gemma Vision (${model}) • encrypted HTTPS`}
        {latency != null && (
          <span className="font-mono text-[10px] text-[#5A7962]">
            {latency}ms
          </span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#CDE1D4] bg-[#EBF4EE] px-3 py-1 text-xs font-semibold text-[#244836]">
      {isLocal ? (
        <Cpu className="h-3 w-3" />
      ) : (
        <Wifi className="h-3 w-3" />
      )}
      {isLocal
        ? `Local Ollama (${model}) • on-device`
        : `Hosted Gemma (${model}) • encrypted HTTPS`}
      {latency != null && (
        <span className="font-mono text-[10px] text-[#5A7962]">
          {latency}ms
        </span>
      )}
    </span>
  );
}

export function QuestDisplay({
  quest,
  onStartQuest,
  onBackToEdit,
}: QuestDisplayProps) {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [briefingDone, setBriefingDone] = useState<boolean>(false);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState<boolean>(false);
  const speechAvailable = isSpeechSupported();

  const handleListenBriefing = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    speakQuest(
      quest,
      () => setIsSpeaking(true),
      () => {
        setIsSpeaking(false);
        setBriefingDone(true);
      },
      () => {
        setIsSpeaking(false);
        setBriefingDone(true);
      }
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Top back bar & Provider Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => {
            stopSpeech();
            onBackToEdit();
          }}
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#667269] transition hover:text-[#1C2720]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <ProviderBadge quest={quest} />
      </div>

      {quest.generationNotice && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-[#E8DFC9] bg-[#F7F2E8] p-3.5 text-xs text-[#6F5E4B]">
          <Info className="h-4 w-4 shrink-0 text-[#A67C52] mt-0.5" />
          <span className="leading-relaxed">{quest.generationNotice}</span>
        </div>
      )}

      {/* Main Quest Card */}
      <div className="rounded-3xl border border-[#E6DFD3] bg-white p-6 shadow-sm sm:p-8">
        {/* Header tags */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#667269]">
          <span className="flex items-center gap-1 rounded-full bg-[#F4EFE6] px-2.5 py-1 font-medium capitalize text-[#4C584E]">
            <Compass className="h-3.5 w-3.5 text-[#244836]" />
            {quest.environment}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-[#F4EFE6] px-2.5 py-1 font-medium text-[#4C584E]">
            <Clock className="h-3.5 w-3.5 text-[#244836]" />
            {quest.durationMinutes} minutes
          </span>
        </div>

        {/* Title & Tagline */}
        <h1 className="mt-3.5 font-serif text-2xl font-bold tracking-tight text-[#1C2720] sm:text-3xl">
          {quest.title}
        </h1>
        <p className="mt-1 text-base text-[#667269] italic">
          &ldquo;{quest.tagline}&rdquo;
        </p>

        {/* Multimodal Scene Observation */}
        {quest.sceneCue && (
          <div className="mt-4 rounded-2xl border border-[#D5E2D8] bg-[#F1F7F3] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#244836]">
                <Camera className="h-4 w-4" />
                <span>Scene Observation</span>
              </div>
              {quest.confidence && (
                <span className="rounded-full bg-[#E8EDE3] px-2.5 py-0.5 text-[10px] font-semibold capitalize text-[#244836]">
                  {quest.confidence} confidence
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm text-[#1C2720] leading-relaxed">
              {quest.sceneCue}
            </p>
          </div>
        )}

        {/* Objective Box */}
        <div className="mt-4 rounded-2xl bg-[#F7F4EC] p-4 text-sm text-[#3E4A40] border border-[#EBE4D5]">
          <strong className="block font-semibold text-[#1C2720] mb-0.5">
            Mission Objective
          </strong>
          {quest.objective}
        </div>

        {/* Look Beyond the Frame (Multimodal Differentiator) */}
        {quest.lookBeyondFrame && (
          <div className="mt-4 rounded-2xl border-2 border-[#BC683D]/30 bg-[#FFFBF8] p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#BC683D]">
              <Eye className="h-4 w-4" />
              <span>Look Beyond The Frame</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-[#1C2720]">
              {quest.lookBeyondFrame}
            </p>
            <p className="mt-1 text-[11px] text-[#8C6D58]">
              The snapshot was just a sensor. Your mission is in the physical world outside the picture.
            </p>
          </div>
        )}

        {/* Sensory Anchor Highlight */}
        <div className="mt-4 rounded-2xl border border-[#D5E2D8] bg-[#F1F7F3] p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#244836]">
            <HandMetal className="h-4 w-4" />
            <span>Tactile / Sensory Anchor</span>
          </div>
          <p className="mt-1 text-sm font-medium text-[#1C2720]">
            {quest.sensoryAnchor}
          </p>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#667269]">
            Step-by-Step Exploration
          </h2>
          <ol className="mt-3 space-y-3">
            {quest.steps.map((step, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 rounded-xl bg-[#FBF9F4] p-3 text-sm text-[#2D3930] border border-[#EFE9DD]"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#244836] text-xs font-bold text-white">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Reflection Teaser */}
        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-dashed border-[#DCD5C6] p-3 text-xs text-[#667269]">
          <HelpCircle className="h-4 w-4 shrink-0 text-[#8C988F] mt-0.5" />
          <div>
            <span className="font-semibold text-[#1C2720]">
              Reflection waiting at the end:
            </span>{" "}
            &ldquo;{quest.reflectionPrompt}&rdquo;
          </div>
        </div>

        {/* Safety Tip */}
        <div className="mt-4 flex items-center gap-2 text-xs text-[#7A867D]">
          <Shield className="h-3.5 w-3.5 shrink-0 text-[#244836]" />
          <span>{quest.safetyTip}</span>
        </div>

        {/* ───── 2-Step Handoff ───── */}
        <div className="mt-8 rounded-2xl border-2 border-dashed border-[#D5E2D8] bg-[#F9FBF9] p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#244836] text-center mb-4">
            Ready? Two steps to nature.
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Step 1: Audio briefing & Voice Settings */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleListenBriefing}
                disabled={!speechAvailable}
                className={`relative flex flex-1 items-center justify-center gap-2 rounded-2xl border px-3 sm:px-4 py-3.5 text-sm font-semibold transition active:scale-95 ${
                  isSpeaking
                    ? "border-amber-600 bg-amber-50 text-amber-800 animate-pulse"
                    : briefingDone
                      ? "border-[#CDE1D4] bg-[#EBF4EE] text-[#244836]"
                      : "border-[#E6DFD3] bg-white text-[#1C2720] hover:bg-[#F2ECE1]"
                } ${!speechAvailable ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="h-4 w-4" />
                    <span>Stop Audio</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 text-[#244836]" />
                    <span>
                      {briefingDone ? "✓ Briefing heard" : "Step 1: Briefing"}
                    </span>
                  </>
                )}
                {!speechAvailable && (
                  <span className="absolute -bottom-5 text-[10px] text-[#8C988F]">
                    Audio not supported in this browser
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsVoiceSettingsOpen(true)}
                disabled={!speechAvailable}
                title="Change narrator voice or pace"
                className="flex items-center justify-center rounded-2xl border border-[#E6DFD3] bg-white px-3.5 py-3.5 text-[#4C584E] transition hover:bg-[#F2ECE1] hover:text-[#1C2720] shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Step 2: Pocket phone & start timer */}
            <button
              type="button"
              onClick={() => {
                stopSpeech();
                onStartQuest();
              }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#244836] px-5 py-3.5 font-serif text-sm font-semibold text-white shadow-md transition hover:bg-[#1B382A] active:scale-95 cursor-pointer"
            >
              <Smartphone className="h-4 w-4" />
              <span>Step 2: Pocket phone &amp; start</span>
            </button>
          </div>
        </div>
      </div>

      {/* Voice Settings Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
      />
    </div>
  );
}
