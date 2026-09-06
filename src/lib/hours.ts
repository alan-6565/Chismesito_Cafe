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

export function isOpenNow(date: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = DAY_INDEX[get("weekday")];
  const minutes = Number(get("hour")) * 60 + Number(get("minute"));

  return openingHours.some(
    ({ days, opens, closes }) => days.includes(day) && minutes >= toMinutes(opens) && minutes < toMinutes(closes)
  );
}
