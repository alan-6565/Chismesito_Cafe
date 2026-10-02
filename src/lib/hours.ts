import { openingHours } from "./data";

// Fixed to the cafe's own timezone rather than the visitor's (or the
// server's, which runs UTC on Vercel) — otherwise a visitor or deploy
// region outside Pacific time would get a wrong answer.
const TIMEZONE = "America/Los_Angeles";
const DAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function pacificNow(date: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { day: DAY_INDEX[get("weekday")], minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export function isOpenNow(date: Date = new Date()): boolean {
  const { day, minutes } = pacificNow(date);
  return openingHours.some(
    ({ days, opens, closes }) => days.includes(day) && minutes >= toMinutes(opens) && minutes < toMinutes(closes)
  );
}

/** "18:30" -> "6:30 PM" */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour12}:00 ${period}` : `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

/** "Open Now · Closes at 7:00 PM" or "Closed · Opens at 7:00 AM" */
export function getTodayScheduleLabel(date: Date = new Date()): string {
  const { day, minutes } = pacificNow(date);
  const today = openingHours.find((s) => s.days.includes(day));
  if (!today) return "Closed today";

  return minutes >= toMinutes(today.opens) && minutes < toMinutes(today.closes)
    ? `Open Now · Closes at ${formatTime(today.closes)}`
    : `Closed · Opens at ${formatTime(today.opens)}`;
}

// ---------------------------------------------------------------------------
// Order-ahead pickup slots
// ---------------------------------------------------------------------------

const SLOT_MINUTES = 15;
// Shortest heads-up the kitchen gets on a scheduled order.
const MIN_LEAD_MINUTES = 15;
const DAYS_AHEAD = 2; // today + tomorrow

export type PickupDay = { date: string; label: string; slots: string[] };

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function minutesToHHMM(minutes: number): string {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

/** Pacific calendar date ("YYYY-MM-DD") of the given instant. */
function pacificDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(date);
}

function addDays(ymd: string, days: number): string {
  const d = new Date(`${ymd}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Every 15-minute pickup time ("HH:MM", shown to customers as AM/PM) the cafe is open for, today
 * and tomorrow. Today skips anything sooner than MIN_LEAD_MINUTES from now;
 * the last slot of a day is 15 minutes before closing.
 */
export function getPickupSlots(now: Date = new Date()): PickupDay[] {
  const { day: todayDow, minutes: nowMinutes } = pacificNow(now);
  const today = pacificDate(now);
  const days: PickupDay[] = [];

  for (let offset = 0; offset < DAYS_AHEAD; offset++) {
    const dow = (todayDow + offset) % 7;
    const hours = openingHours.find((s) => s.days.includes(dow));
    if (!hours) continue;

    let start = toMinutes(hours.opens);
    if (offset === 0) {
      const earliest = Math.ceil((nowMinutes + MIN_LEAD_MINUTES) / SLOT_MINUTES) * SLOT_MINUTES;
      start = Math.max(start, earliest);
    }
    const slots: string[] = [];
    for (let m = start; m <= toMinutes(hours.closes) - SLOT_MINUTES; m += SLOT_MINUTES) {
      slots.push(minutesToHHMM(m));
    }
    if (!slots.length) continue;

    const date = addDays(today, offset);
    const label =
      offset === 0
        ? "Today"
        : offset === 1
          ? "Tomorrow"
          : new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
    days.push({ date, label, slots });
  }
  return days;
}

/** Converts a Pacific wall-clock date + "HH:MM" into a UTC ISO string. */
function pacificToISO(ymd: string, hhmm: string): string {
  const asUTC = new Date(`${ymd}T${hhmm}:00Z`);
  // Pacific's offset from UTC at (roughly) that moment, DST-aware.
  const tzName = new Intl.DateTimeFormat("en-US", { timeZone: TIMEZONE, timeZoneName: "longOffset" })
    .formatToParts(asUTC)
    .find((p) => p.type === "timeZoneName")?.value; // e.g. "GMT-07:00"
  const match = tzName?.match(/GMT([+-])(\d{2}):(\d{2})/);
  const offsetMinutes = match ? (match[1] === "-" ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3])) : 0;
  return new Date(asUTC.getTime() - offsetMinutes * 60000).toISOString();
}

/**
 * Validates a requested pickup ("YYYY-MM-DDTHH:MM" in Pacific time) against
 * the slots actually on offer right now. Returns the UTC ISO timestamp to
 * store, or null if it isn't a real open slot.
 */
export function resolvePickupSlot(slot: string, now: Date = new Date()): string | null {
  const [date, time] = slot.split("T");
  const day = getPickupSlots(now).find((d) => d.date === date);
  if (!day || !day.slots.includes(time)) return null;
  return pacificToISO(date, time);
}

/** "Wed, Oct 1, 2026 · 2:32 PM" in Pacific time. */
export function formatOrderStamp(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${date} · ${formatClock(iso)}`;
}

/** "2:32 PM" in Pacific time. */
export function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "Today 2:30 PM" / "Tomorrow 8:15 AM" / "Fri, Oct 3 9:00 AM" relative to now, Pacific. */
export function formatPickupTime(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const dayDiff = Math.round(
    (new Date(`${pacificDate(d)}T12:00:00Z`).getTime() - new Date(`${pacificDate(now)}T12:00:00Z`).getTime()) / 86400000
  );
  const day =
    dayDiff === 0
      ? "Today"
      : dayDiff === 1
        ? "Tomorrow"
        : d.toLocaleDateString("en-US", { timeZone: TIMEZONE, weekday: "short", month: "short", day: "numeric" });
  return `${day} ${formatClock(iso)}`;
}
