/** Display formatting. Always pass the recipient's timezone: the family may live elsewhere. */

const timeFmt = new Map<string, Intl.DateTimeFormat>();
const dayFmt = new Map<string, Intl.DateTimeFormat>();

export function fmtTime(d: Date, timeZone: string) {
  let f = timeFmt.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" });
    timeFmt.set(timeZone, f);
  }
  return f.format(d);
}

export function fmtDay(d: Date, timeZone: string) {
  let f = dayFmt.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", month: "short", day: "numeric" });
    dayFmt.set(timeZone, f);
  }
  return f.format(d);
}

/** Local hour (0–23) in `timeZone`. */
export function localHour(d: Date, timeZone: string) {
  return Number(
    new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hourCycle: "h23" }).format(d),
  );
}

const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

/** "5 minutes ago", "yesterday", "in 3 days". */
export function fmtRelative(d: Date, now: Date) {
  const sec = Math.round((d.getTime() - now.getTime()) / 1000);
  const abs = Math.abs(sec);
  if (abs < 60) return "just now";
  if (abs < 3600) return rtf.format(Math.round(sec / 60), "minute");
  if (abs < 86_400) return rtf.format(Math.round(sec / 3600), "hour");
  return rtf.format(Math.round(sec / 86_400), "day");
}

/** "08:00" → "8:00 AM", "20:30" → "8:30 PM". */
export function fmtClock(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h < 12 ? "AM" : "PM";
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export const MOOD_LABEL: Record<number, string> = { 1: "Not well", 2: "Okay", 3: "Good" };
