/**
 * The single shared demo family: Anna (organizer) + Ben (sibling) + Clara
 * (invited, not joined yet) caring for Rose. Idempotent: deletes and recreates
 * slug "demo". Used by `npm run db:seed` and the in-app "Reset demo" button.
 *
 *   Anna's app:  /app
 *   Rose's link: /r/demo-rose
 *   Ben's invite: /join/demo-ben
 */
import { eq } from "drizzle-orm";
import { DEMO_BEN_INVITE, DEMO_ROSE_TOKEN, DEMO_SLUG } from "@/lib/demo";
import { localDay, zonedToUtc } from "@/lib/time";
import { randomToken } from "@/lib/tokens";
import { db } from "./index";
import * as schema from "./schema";

const TZ = "America/New_York";
const MIN = 60_000;
const DAY = 86_400_000;

export async function seedDemo(now = new Date()) {
  const dayStr = (offset: number) => localDay(TZ, now, offset);
  const at = (offset: number, time: string) => zonedToUtc(dayStr(offset), time, TZ);

  await db.delete(schema.families).where(eq(schema.families.slug, DEMO_SLUG));

  const [family] = await db
    .insert(schema.families)
    .values({ name: "Rose's care circle", slug: DEMO_SLUG })
    .returning();

  const [anna, ben] = await db
    .insert(schema.members)
    .values([
      {
        familyId: family.id,
        name: "Anna",
        email: "anna@example.com",
        phone: "+15555550101",
        role: "organizer" as const,
        inviteToken: randomToken(),
        joinedAt: new Date(now.getTime() - 14 * DAY),
      },
      {
        // Not joined yet, so the /join/demo-ben flow can be shown live.
        familyId: family.id,
        name: "Ben",
        email: "ben@example.com",
        role: "sibling" as const,
        inviteToken: DEMO_BEN_INVITE,
      },
      {
        familyId: family.id,
        name: "Clara",
        email: "clara@example.com",
        role: "sibling" as const,
        inviteToken: randomToken(),
      },
    ])
    .returning();

  const [rose] = await db
    .insert(schema.careRecipients)
    .values({
      familyId: family.id,
      name: "Rose",
      phone: "+15555550100",
      privateToken: DEMO_ROSE_TOKEN,
      timezone: TZ,
    })
    .returning();

  const meds = await db
    .insert(schema.medications)
    .values([
      {
        careRecipientId: rose.id,
        name: "Lisinopril",
        strength: "10 mg",
        dose: "1 tablet",
        scheduleTimes: ["08:00"],
        instructions: "Take in the morning",
        pillsLeft: 24,
        refillDate: dayStr(24),
        source: "photo" as const,
      },
      {
        careRecipientId: rose.id,
        name: "Metformin",
        strength: "500 mg",
        dose: "1 tablet",
        scheduleTimes: ["08:00", "20:00"],
        instructions: "Take with food",
        pillsLeft: 12, // 6 days left → refill warning
        refillDate: dayStr(6),
        source: "photo" as const,
      },
      {
        careRecipientId: rose.id,
        name: "Atorvastatin",
        strength: "20 mg",
        dose: "1 tablet",
        scheduleTimes: ["21:00"],
        instructions: "Take in the evening",
        pillsLeft: 40,
        refillDate: dayStr(40),
        source: "manual" as const,
      },
    ])
    .returning();

  const byName = Object.fromEntries(meds.map((m) => [m.name, m]));

  // Two missed doses in the past week; every other past dose was taken.
  const missed = new Set([
    `${byName.Metformin.id}|${at(-3, "20:00").toISOString()}`,
    `${byName.Lisinopril.id}|${at(-1, "08:00").toISOString()}`,
  ]);

  const doseRows: (typeof schema.doseEvents.$inferInsert)[] = [];
  for (let offset = -6; offset <= 1; offset++) {
    for (const med of meds) {
      for (const time of med.scheduleTimes) {
        const scheduledAt = at(offset, time);
        const past = scheduledAt.getTime() < now.getTime();
        const isMissed = missed.has(`${med.id}|${scheduledAt.toISOString()}`);
        doseRows.push({
          medicationId: med.id,
          careRecipientId: rose.id,
          scheduledAt,
          status: !past ? "due" : isMissed ? "missed" : "taken",
          confirmedAt:
            past && !isMissed
              ? new Date(scheduledAt.getTime() + (5 + (((offset + 7) * 7) % 20)) * MIN)
              : null,
        });
      }
    }
  }
  await db.insert(schema.doseEvents).values(doseRows);

  const moods = [3, 3, 2, 3, 3, 2, 3];
  await db.insert(schema.checkIns).values(
    moods.map((mood, i) => ({ careRecipientId: rose.id, mood, createdAt: at(i - 6, "08:20") })),
  );

  await db.insert(schema.appointments).values([
    {
      careRecipientId: rose.id,
      title: "Cardiology follow-up",
      provider: "Dr. Patel",
      location: "Riverside Heart Clinic, 2nd floor",
      startsAt: at(3, "10:30"),
      notes: "Bring the blood pressure log.",
    },
    {
      careRecipientId: rose.id,
      title: "Blood test (A1C)",
      provider: "Quest Diagnostics",
      location: "Main St. lab",
      startsAt: at(10, "09:00"),
      notes: "Fasting from midnight.",
    },
  ]);

  await db.insert(schema.tasks).values([
    {
      familyId: family.id,
      title: "Pick up Metformin refill",
      assigneeMemberId: ben.id,
      createdByMemberId: anna.id,
      dueDate: dayStr(4),
    },
    {
      familyId: family.id,
      title: "Call Medicare about Part D coverage",
      assigneeMemberId: anna.id,
      createdByMemberId: anna.id,
      dueDate: dayStr(2),
    },
    {
      familyId: family.id,
      title: "Drive Mom to her eye exam",
      assigneeMemberId: anna.id,
      createdByMemberId: anna.id,
      dueDate: dayStr(-2),
      status: "done" as const,
      completedAt: at(-2, "15:10"),
    },
  ]);

  await db.insert(schema.activity).values([
    {
      familyId: family.id,
      actorMemberId: anna.id,
      kind: "med_added",
      message: "Anna added Lisinopril and Metformin from bottle photos",
      createdAt: new Date(now.getTime() - 14 * DAY),
    },
    {
      familyId: family.id,
      kind: "dose_missed",
      message: "Rose missed her 8:00 PM Metformin",
      createdAt: at(-3, "20:30"),
    },
    {
      familyId: family.id,
      actorMemberId: anna.id,
      kind: "task_done",
      message: "Anna marked “Drive Mom to her eye exam” done",
      createdAt: at(-2, "15:10"),
    },
    {
      familyId: family.id,
      kind: "dose_missed",
      message: "Rose missed her 8:00 AM Lisinopril",
      createdAt: at(-1, "08:30"),
    },
  ]);

  return {
    day: dayStr(0),
    meds: meds.length,
    doses: doseRows.length,
    missed: doseRows.filter((d) => d.status === "missed").length,
  };
}
