import "server-only";
import { and, asc, desc, eq, gte, lt } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "@/db";
import {
  activity,
  appointments,
  checkIns,
  doseEvents,
  medications,
  members,
  tasks,
} from "@/db/schema";
import { effectiveStatus, type DoseStatus } from "@/lib/doses";
import { todayBounds } from "./family";

const DAY = 86_400_000;

/** Days of pills left at the current schedule, or null if unknown. */
export function daysLeft(m: { pillsLeft: number | null; pillsPerDose: number; scheduleTimes: string[] }) {
  if (m.pillsLeft == null) return null;
  const perDay = m.pillsPerDose * Math.max(1, m.scheduleTimes.length);
  return Math.floor(m.pillsLeft / perDay);
}

export type TodayDose = {
  id: string;
  scheduledAt: Date;
  confirmedAt: Date | null;
  status: DoseStatus;
  name: string;
  strength: string | null;
};

/** Everything the Today tab needs, fetched in parallel. */
export async function getTodayView(recipientId: string, timeZone: string) {
  await connection();
  const now = new Date();
  const { start, end } = todayBounds(timeZone, now);
  const windowStart = new Date(Math.min(start.getTime(), now.getTime() - DAY));

  const [doseRows, [mood], [nextAppt], meds] = await Promise.all([
    db
      .select({
        id: doseEvents.id,
        scheduledAt: doseEvents.scheduledAt,
        confirmedAt: doseEvents.confirmedAt,
        status: doseEvents.status,
        name: medications.name,
        strength: medications.strength,
      })
      .from(doseEvents)
      .innerJoin(medications, eq(doseEvents.medicationId, medications.id))
      .where(
        and(
          eq(doseEvents.careRecipientId, recipientId),
          gte(doseEvents.scheduledAt, windowStart),
          lt(doseEvents.scheduledAt, end),
        ),
      )
      .orderBy(asc(doseEvents.scheduledAt), asc(medications.name)),
    db
      .select({ mood: checkIns.mood, createdAt: checkIns.createdAt })
      .from(checkIns)
      .where(eq(checkIns.careRecipientId, recipientId))
      .orderBy(desc(checkIns.createdAt))
      .limit(1),
    db
      .select()
      .from(appointments)
      .where(and(eq(appointments.careRecipientId, recipientId), gte(appointments.startsAt, now)))
      .orderBy(asc(appointments.startsAt))
      .limit(1),
    db
      .select({
        id: medications.id,
        name: medications.name,
        pillsLeft: medications.pillsLeft,
        pillsPerDose: medications.pillsPerDose,
        scheduleTimes: medications.scheduleTimes,
      })
      .from(medications)
      .where(and(eq(medications.careRecipientId, recipientId), eq(medications.active, true))),
  ]);

  const doses: TodayDose[] = doseRows.map((d) => ({ ...d, status: effectiveStatus(d, now) }));
  const today = doses.filter((d) => d.scheduledAt >= start);
  // Missed in the last 24 hours: the loud alert at the top.
  const missed = doses.filter(
    (d) => d.status === "missed" && d.scheduledAt.getTime() >= now.getTime() - DAY,
  );
  const refills = meds
    .map((m) => ({ id: m.id, name: m.name, days: daysLeft(m) }))
    .filter((m): m is { id: string; name: string; days: number } => m.days !== null && m.days <= 7)
    .sort((a, b) => a.days - b.days);

  return { now, today, missed, mood: mood ?? null, nextAppt: nextAppt ?? null, refills };
}

export async function getMedsView(recipientId: string) {
  await connection();
  return db
    .select()
    .from(medications)
    .where(and(eq(medications.careRecipientId, recipientId), eq(medications.active, true)))
    .orderBy(asc(medications.name));
}

export async function getFamilyView(familyId: string) {
  await connection();
  const [people, taskRows, feed] = await Promise.all([
    db
      .select()
      .from(members)
      .where(eq(members.familyId, familyId))
      .orderBy(asc(members.createdAt), asc(members.name)),
    db
      .select({
        id: tasks.id,
        title: tasks.title,
        status: tasks.status,
        dueDate: tasks.dueDate,
        completedAt: tasks.completedAt,
        assigneeId: tasks.assigneeMemberId,
        assigneeName: members.name,
      })
      .from(tasks)
      .leftJoin(members, eq(tasks.assigneeMemberId, members.id))
      .where(eq(tasks.familyId, familyId))
      .orderBy(asc(tasks.status), asc(tasks.dueDate), desc(tasks.createdAt)),
    db
      .select()
      .from(activity)
      .where(eq(activity.familyId, familyId))
      .orderBy(desc(activity.createdAt))
      .limit(20),
  ]);
  return { now: new Date(), people, tasks: taskRows, feed };
}
