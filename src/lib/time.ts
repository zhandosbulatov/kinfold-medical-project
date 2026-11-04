/** Time helpers. Schedules are stored as local "HH:MM" in the recipient's timezone. */

const dtfCache = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string) {
  let f = dtfCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    dtfCache.set(timeZone, f);
  }
  return f;
}

/** Offset (minutes) of `timeZone` from UTC at instant `at`. */
function offsetMinutes(at: Date, timeZone: string) {
  const p = Object.fromEntries(
    partsFormatter(timeZone)
      .formatToParts(at)
      .map((x) => [x.type, x.value]),
  );
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return Math.round((asUtc - at.getTime()) / 60_000);
}

/** "2026-11-04" + "08:00" in America/New_York → UTC Date. */
export function zonedToUtc(day: string, time: string, timeZone: string): Date {
  const naive = new Date(`${day}T${time}:00Z`);
  const first = new Date(naive.getTime() - offsetMinutes(naive, timeZone) * 60_000);
  // Second pass corrects around DST transitions.
  return new Date(naive.getTime() - offsetMinutes(first, timeZone) * 60_000);
}

/** Local calendar day "YYYY-MM-DD" in `timeZone`, shifted by `addDays`. */
export function localDay(timeZone: string, at = new Date(), addDays = 0): string {
  const shifted = new Date(at.getTime() + addDays * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(shifted);
}
