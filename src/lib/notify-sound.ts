"use client";

// A bell-like chime synthesized via the Web Audio API — no audio file to
// host, and no copyright risk from a downloaded sound effect. Browsers
// block audio until there's been a user gesture on the page, so
// `enableSound()` (called from a click handler) creates/resumes the shared
// AudioContext; later calls to `playChime()` reuse it.

let ctx: AudioContext | null = null;

export function enableSound(): void {
  if (!ctx) {
    ctx = new AudioContext();
  }
  if (ctx.state === "suspended") {
    ctx.resume();
  }
}

export function isSoundEnabled(): boolean {
  return !!ctx && ctx.state === "running";
}

// A single bell strike: fundamental + a quiet fifth-above overtone, so it
// reads as a metallic "ding" rather than a plain synth beep.
function bell(startTime: number, freq: number, duration: number, gainPeak: number) {
  if (!ctx) return;
  for (const [ratio, level] of [
    [1, gainPeak],
    [2.4, gainPeak * 0.35],
  ] as const) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq * ratio;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(level, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

// Bright ascending three-note "cha-ching" — louder and more attention
// grabbing than a soft two-tone beep, meant to cut through cafe noise.
export function playChime(): void {
  if (!ctx) return;
  const now = ctx.currentTime;
  bell(now, 1046.5, 0.16, 0.5); // C6
  bell(now + 0.12, 1318.5, 0.16, 0.5); // E6
  bell(now + 0.24, 1568.0, 0.32, 0.55); // G6, held slightly longer
}
