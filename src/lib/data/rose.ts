import "server-only";
import { and, asc, desc, eq, gte, lt } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "@/db";
import { checkIns, doseEvents, medications, members } from "@/db/schema";
import { effectiveStatus } from "@/lib/doses";
import { fmtTime, localHour } from "@/lib/format";
import { getRecipientByToken, todayBounds } from "./family";

/** Pills may be confirmed from this long before their time. */
const EARLY_MS = 60 * 60_000;

export type PillSlot = {
  /** ISO timestamp shared by every dose in the slot. */
  at: string;
  timeLabel: string;
  partOfDay: "morning" | "afternoon" | "evening";
  overdue: boolean;
  pills: { name: string; strength: string | null; dose: string | null }[];
};

function partOfDay(hour: number): PillSlot["partOfDay"] {
  return hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
}

export function greeting(now: Date, timeZone: string) {
  const h = localHour(now, timeZone);
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

/**
 * Everything Rose's one-screen page needs. `current` is the earliest slot
 * today that isn't taken and is due within the hour (or already late);
 * `next` is the following slot later today, if any.
 */
export async function getRoseView(token: string) {
  const recipient = await getRecipientByToken(token);
  if (!recipient) return null;
  await connection();
  const now = new Date();
  const tz = recipient.timezone;
  const { start, end } = todayBounds(tz, now);

  const [doses, [caregiver], [mood]] = await Promise.all([
    db
      .select({
        scheduledAt: doseEvents.scheduledAt,
        status: doseEvents.status,
        name: medications.name,
        strength: medications.strength,
        dose: medications.dose,
      })
      .from(doseEvents)
      .innerJoin(medications, eq(doseEvents.medicationId, medications.id))
      .where(
        and(
          eq(doseEvents.careRecipientId, recipient.id),
          gte(doseEvents.scheduledAt, start),
          lt(doseEvents.scheduledAt, end),
        ),
      )
      .orderBy(asc(doseEvents.scheduledAt), asc(medications.name)),
    db
      .select({ name: members.name, phone: members.phone })
      .from(members)
      .where(and(eq(members.familyId, recipient.familyId), eq(members.role, "organizer")))
      .limit(1),
    db
      .select({ mood: checkIns.mood })
      .from(checkIns)
      .where(and(eq(checkIns.careRecipientId, recipient.id), gte(checkIns.createdAt, start)))
      .orderBy(desc(checkIns.createdAt))
      .limit(1),
  ]);

  // Group untaken doses into time slots.
  const slots = new Map<string, PillSlot>();
  for (const d of doses) {
    if (d.status === "taken") continue;
    const at = d.scheduledAt.toISOString();
    let slot = slots.get(at);
    if (!slot) {
      slot = {
        at,
        timeLabel: fmtTime(d.scheduledAt, tz),
        partOfDay: partOfDay(localHour(d.scheduledAt, tz)),
        overdue: effectiveStatus(d, now) === "missed",
        pills: [],
      };
      slots.set(at, slot);
    }
    slot.pills.push({ name: d.name, strength: d.strength, dose: d.dose });
  }
  const open = [...slots.values()];
  const current =
    open.find((s) => new Date(s.at).getTime() - EARLY_MS <= now.getTime()) ?? null;
  const next = open.find((s) => s !== current && new Date(s.at).getTime() > now.getTime()) ?? null;

  return {
    recipient: { name: recipient.name },
    greeting: greeting(now, tz),
    caregiver: caregiver ?? null,
    current,
    next,
    takenToday: doses.some((d) => d.status === "taken"),
    moodToday: mood?.mood ?? null,
  };
}
