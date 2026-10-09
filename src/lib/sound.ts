/**
 * Web Audio API synthesized tranquil chime
 * Creates an organic bell/singing bowl sound without external audio files.
 */
export function playMindfulChime(): void {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Harmonic frequencies resembling a meditation bowl (Fundamental ~ 528Hz Love/Nature tone + harmonics)
    const frequencies = [528, 1056, 1584];
    const gains = [0.35, 0.15, 0.05];

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(gains[idx], now + 0.05); // quick soft attack
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0); // long natural decay

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 3.2);
    });
  } catch (e) {
    console.warn("Audio chime unavailable:", e);
  }
}
