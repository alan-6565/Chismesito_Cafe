// Which seasonal "skin" the site wears. Kept as simple month/day ranges in
// Richmond time so the cafe never has to remember to flip anything.
export type Season = "holiday" | "fall" | "classic";

// [startMonth, startDay] inclusive → [endMonth, endDay] inclusive (1-based months).
// Holiday wraps the new year.
const RANGES: { season: Exclude<Season, "classic">; from: [number, number]; to: [number, number] }[] = [
  { season: "holiday", from: [11, 1], to: [1, 6] },
  { season: "fall", from: [9, 1], to: [10, 31] },
];

function inRange(m: number, d: number, from: [number, number], to: [number, number]) {
  const v = m * 100 + d;
  const a = from[0] * 100 + from[1];
  const b = to[0] * 100 + to[1];
  return a <= b ? v >= a && v <= b : v >= a || v <= b;
}

export function seasonFor(date: Date = new Date()): Season {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", month: "numeric", day: "numeric" }).formatToParts(date);
  const m = Number(parts.find((p) => p.type === "month")?.value);
  const d = Number(parts.find((p) => p.type === "day")?.value);
  return RANGES.find((r) => inRange(m, d, r.from, r.to))?.season ?? "classic";
}

/** Inline <head> script: sets <html data-season> before first paint, even on pre-built pages. */
export const seasonScript = `(function(){try{var p=new Intl.DateTimeFormat("en-US",{timeZone:"America/Los_Angeles",month:"numeric",day:"numeric"}).formatToParts(new Date());var m=+p.find(function(x){return x.type==="month"}).value,d=+p.find(function(x){return x.type==="day"}).value;var v=m*100+d;var s=(v>=1101||v<=106)?"holiday":(v>=901&&v<=1031)?"fall":"classic";var q=new URLSearchParams(location.search).get("season");if(q==="holiday"||q==="fall"||q==="classic")s=q;document.documentElement.setAttribute("data-season",s)}catch(e){}})();`;

/**
 * Inline <head> script: plays the opening intro (IntroCurtain) on the first
 * page of a browser session only. ?intro=1 forces it for previews. Skipped on
 * /admin and for reduced-motion users. The attribute is removed once the
 * curtain has opened so it never sits on top of the page.
 */
export const introScript = `(function(){try{var h=document.documentElement,q=new URLSearchParams(location.search).get("intro")==="1";if(location.pathname.indexOf("/admin")===0)return;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;if(!q&&sessionStorage.getItem("cc-intro"))return;sessionStorage.setItem("cc-intro","1");h.setAttribute("data-intro","");setTimeout(function(){h.removeAttribute("data-intro")},3500)}catch(e){}})();`;
