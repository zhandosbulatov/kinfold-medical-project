"use server";

import { and, asc, eq, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { activity, doseEvents, medications } from "@/db/schema";
import { seedDemo } from "@/db/seed-demo";
import { MISSED_AFTER_MINUTES } from "@/lib/demo";
import { getDemoFamily } from "@/lib/data/family";

// Demo-only controls. No auth by design: the whole app is a public demo with
// one shared family, and these only touch that family's seeded data.

/** Wipes and re-seeds the shared demo family. */
export async function resetDemo() {
  await seedDemo();
  revalidatePath("/", "layout");
}

/**
 * Makes Rose's next upcoming dose overdue so the missed-dose alert shows
 * immediately, without waiting 30 minutes on stage.
 */
export async function simulateMissedDose() {
  const demo = await getDemoFamily();
  if (!demo) return;
  const now = new Date();

  const [next] = await db
    .select({ id: doseEvents.id, name: medications.name })
    .from(doseEvents)
    .innerJoin(medications, eq(doseEvents.medicationId, medications.id))
    .where(
      and(
        eq(doseEvents.careRecipientId, demo.recipient.id),
        eq(doseEvents.status, "due"),
        gte(doseEvents.scheduledAt, now),
      ),
    )
    .orderBy(asc(doseEvents.scheduledAt))
    .limit(1);
  if (!next) return;

  const overdueAt = new Date(now.getTime() - (MISSED_AFTER_MINUTES + 1) * 60_000);
  await Promise.all([
    db.update(doseEvents).set({ scheduledAt: overdueAt }).where(eq(doseEvents.id, next.id)),
    db.insert(activity).values({
      familyId: demo.family.id,
      kind: "dose_missed",
      message: `${demo.recipient.name} missed her ${next.name}`,
    }),
  ]);
  revalidatePath("/", "layout");
}
