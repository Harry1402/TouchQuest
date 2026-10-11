"use client";

import React, { useState, useEffect } from "react";
import { X, Volume2, Play, Square, Check, SlidersHorizontal } from "lucide-react";
import {
  getAvailableVoices,
  getStoredVoicePreference,
  saveVoicePreference,
  previewVoiceSample,
  stopSpeech,
  VoicePreference,
} from "@/lib/speech";

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SPEED_PRESETS = [
  { label: "Mindful Pace", rate: 0.85, desc: "Relaxed & unhurried" },
  { label: "Natural", rate: 0.95, desc: "Conversational" },
  { label: "Brisk", rate: 1.1, desc: "Fast & energetic" },
];

export function VoiceSettingsModal({ isOpen, onClose }: VoiceSettingsModalProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>("");
  const [rate, setRate] = useState<number>(0.92);
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const initialPref = getStoredVoicePreference();
    const voicesPromise = getAvailableVoices();
    let isCancelled = false;

    voicesPromise.then((loadedVoices) => {
      if (isCancelled) return;
      setVoices(loadedVoices);
      setRate(initialPref.rate);
      if (initialPref.voiceUri) {
        setSelectedVoiceUri(initialPref.voiceUri);
      } else if (loadedVoices.length > 0) {
        // Find best natural or default voice
        const natural = loadedVoices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Natural") ||
              v.name.includes("Neural") ||
              v.name.includes("Google") ||
              v.name.includes("Jenny"))
        );
        setSelectedVoiceUri(natural ? natural.voiceURI : loadedVoices[0].voiceURI);
      }
    });

    return () => {
      isCancelled = true;
      stopSpeech();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePreview = () => {
    if (isPreviewing) {
      stopSpeech();
      setIsPreviewing(false);
      return;
    }

    setIsPreviewing(true);
    previewVoiceSample(
      selectedVoiceUri || null,
      rate,
      () => setIsPreviewing(true),
      () => setIsPreviewing(false)
    );
  };

  const handleSave = () => {
    stopSpeech();
    const newPref: VoicePreference = {
      voiceUri: selectedVoiceUri || null,
      rate,
    };
    saveVoicePreference(newPref);
    onClose();
  };

  // Group English voices first for nature narration
  const englishVoices = voices.filter((v) => v.lang.startsWith("en"));
  const otherVoices = voices.filter((v) => !v.lang.startsWith("en"));

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md rounded-3xl border border-[#E6DFD3] bg-[#FBF9F4] p-6 shadow-2xl sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6DFD3] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8EDE3] text-[#244836]">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1C2720]">
                Audio Briefing Voice
              </h2>
              <p className="text-xs text-[#667269]">
                Choose your narrator and walking pace
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="rounded-full p-1.5 text-[#667269] transition hover:bg-[#EAE4D7] hover:text-[#1C2720] cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-5">
          {/* Voice Dropdown */}
          <div>
            <label
              htmlFor="voice-select"
              className="block text-xs font-semibold text-[#1C2720] mb-1.5"
            >
              Narrator Voice ({voices.length} detected)
            </label>
            <div className="relative">
              <select
                id="voice-select"
                value={selectedVoiceUri}
                onChange={(e) => {
                  stopSpeech();
                  setIsPreviewing(false);
                  setSelectedVoiceUri(e.target.value);
                }}
                className="w-full rounded-2xl border border-[#D5E2D8] bg-white px-3.5 py-2.5 text-xs font-medium text-[#1C2720] shadow-2xs focus:border-[#244836] focus:outline-hidden cursor-pointer"
              >
                {englishVoices.length > 0 && (
                  <optgroup label="English Voices (Recommended)">
                    {englishVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                        {v.name.includes("Natural") || v.name.includes("Neural")
                          ? " • Natural"
                          : ""}
                      </option>
                    ))}
                  </optgroup>
                )}
                {otherVoices.length > 0 && (
                  <optgroup label="Other Installed Languages">
                    {otherVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>

          {/* Speed Presets */}
          <div>
            <label className="block text-xs font-semibold text-[#1C2720] mb-2">
              Narration Cadence
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SPEED_PRESETS.map((preset) => {
                const isSelected = Math.abs(rate - preset.rate) < 0.05;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setRate(preset.rate);
                      stopSpeech();
                      setIsPreviewing(false);
                    }}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-2.5 text-center transition cursor-pointer ${
                      isSelected
                        ? "border-[#244836] bg-[#244836] text-white shadow-xs"
                        : "border-[#E6DFD3] bg-white text-[#1C2720] hover:bg-[#F4EFE6]"
                    }`}
                  >
                    <span className="text-xs font-bold">{preset.label}</span>
                    <span
                      className={`text-[10px] mt-0.5 ${
                        isSelected ? "text-[#D5E2D8]" : "text-[#7B877E]"
                      }`}
                    >
                      {preset.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Test Sample Button */}
          <div className="rounded-2xl border border-[#E6DFD3] bg-[#F7F4EC] p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#4C584E]">
              <Volume2 className="h-4 w-4 text-[#244836]" />
              <span>Hear a sample sentence</span>
            </div>
            <button
              type="button"
              onClick={handlePreview}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#D5E2D8] bg-white px-3 py-1.5 text-xs font-semibold text-[#244836] shadow-2xs transition hover:bg-[#E8EDE3] cursor-pointer"
            >
              {isPreviewing ? (
                <>
                  <Square className="h-3 w-3 fill-[#244836]" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 fill-[#244836]" />
                  <span>Test Voice</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-[#E6DFD3] pt-4">
          <button
            type="button"
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-[#667269] transition hover:bg-[#EAE4D7] hover:text-[#1C2720] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#244836] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1B382A] cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Apply Voice</span>
          </button>
        </div>
      </div>
    </div>
  );
}
