"use client";

// A short two-tone chime synthesized via the Web Audio API — no audio file
// to host. Browsers block audio until there's been a user gesture on the
// page, so `enableSound()` (called from a click handler) creates/resumes the
// shared AudioContext; later calls to `playChime()` reuse it.

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

function tone(startTime: number, freq: number, duration: number) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

export function playChime(): void {
  if (!ctx) return;
  const now = ctx.currentTime;
  tone(now, 880, 0.18);
  tone(now + 0.16, 1108.73, 0.22);
}
