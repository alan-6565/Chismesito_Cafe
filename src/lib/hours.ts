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

function formatTime(hhmm: string): string {
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
