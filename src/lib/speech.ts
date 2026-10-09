import { Quest } from "@/types/quest";

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function stopSpeech(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
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

  // Cancel any ongoing speech first
  window.speechSynthesis.cancel();

  const narrationText = [
    `Mission: ${quest.title}.`,
    quest.objective,
    "Here are your steps for this mission.",
    ...quest.steps.map((s, idx) => `Step ${idx + 1}: ${s}`),
    `Observation anchor: ${quest.sensoryAnchor}`,
    "Now put your phone in your pocket and step into nature.",
  ].join(". ");

  const utterance = new SpeechSynthesisUtterance(narrationText);
  utterance.rate = 0.92; // Slightly relaxed, unhurried cadence
  utterance.pitch = 1.0;
  utterance.lang = "en-US";

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
