import { Quest } from "@/types/quest";

export interface VoicePreference {
  voiceUri: string | null;
  rate: number; // 0.75 to 1.3
}

const VOICE_PREF_KEY = "touchquest_voice_settings";

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function stopSpeech(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}

export function getStoredVoicePreference(): VoicePreference {
  if (typeof window === "undefined") {
    return { voiceUri: null, rate: 0.92 };
  }
  try {
    const raw = localStorage.getItem(VOICE_PREF_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        voiceUri: typeof parsed.voiceUri === "string" ? parsed.voiceUri : null,
        rate:
          typeof parsed.rate === "number"
            ? Math.max(0.7, Math.min(1.3, parsed.rate))
            : 0.92,
      };
    }
  } catch {
    // fallback to defaults
  }
  return { voiceUri: null, rate: 0.92 };
}

export function saveVoicePreference(pref: VoicePreference): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VOICE_PREF_KEY, JSON.stringify(pref));
  } catch {
    // ignore local storage quota / sandbox errors
  }
}

export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!isSpeechSupported()) return Promise.resolve([]);

  return new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    const handler = () => {
      voices = window.speechSynthesis.getVoices();
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      resolve(voices);
    };

    window.speechSynthesis.addEventListener("voiceschanged", handler);
    // Timeout fallback in case voiceschanged does not fire
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices());
    }, 400);
  });
}

function resolveVoice(
  voiceUri: string | null,
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  if (voiceUri) {
    const matched = voices.find((v) => v.voiceURI === voiceUri);
    if (matched) return matched;
  }

  // If no stored voice or not found, prioritize natural/neural English voices
  const naturalEnglish = voices.find(
    (v) =>
      v.lang.startsWith("en") &&
      (v.name.includes("Natural") ||
        v.name.includes("Neural") ||
        v.name.includes("Google") ||
        v.name.includes("Jenny") ||
        v.name.includes("Aria"))
  );
  if (naturalEnglish) return naturalEnglish;

  const anyEnglish = voices.find((v) => v.lang.startsWith("en"));
  return anyEnglish || voices[0] || null;
}

export function previewVoiceSample(
  voiceUri: string | null,
  rate = 0.92,
  onStart?: () => void,
  onEnd?: () => void
): void {
  if (!isSpeechSupported()) return;
  stopSpeech();

  const previewText =
    "Welcome to TouchQuest. Step outside, pocket your phone, and connect with nature.";
  const utterance = new SpeechSynthesisUtterance(previewText);
  utterance.rate = rate;

  const voices = window.speechSynthesis.getVoices();
  const voice = resolveVoice(voiceUri, voices);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };
  utterance.onend = () => {
    if (onEnd) onEnd();
  };
  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

export function speakQuest(
  quest: Quest,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: unknown) => void
): void {
  if (!isSpeechSupported()) {
    if (onError) onError(new Error("Speech synthesis not supported in this browser"));
    return;
  }

  window.speechSynthesis.cancel();

  const pref = getStoredVoicePreference();
  const narrationText = [
    `Mission: ${quest.title}.`,
    quest.objective,
    "Here are your steps for this mission.",
    ...quest.steps.map((s, idx) => `Step ${idx + 1}: ${s}`),
    `Observation anchor: ${quest.sensoryAnchor}`,
    "Now put your phone in your pocket and step into nature.",
  ].join(". ");

  const utterance = new SpeechSynthesisUtterance(narrationText);
  utterance.rate = pref.rate;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const voice = resolveVoice(pref.voiceUri, voices);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = "en-US";
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn("Speech synthesis notice:", e);
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}
