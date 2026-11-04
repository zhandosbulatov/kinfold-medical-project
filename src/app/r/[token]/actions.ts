"use server";

import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { activity, careRecipients, checkIns, doseEvents, medications } from "@/db/schema";
import { fmtTime } from "@/lib/format";

// Rose's link is the credential: every action re-resolves the token and only
// touches that recipient's rows.

async function recipientFor(token: string) {
  const [r] = await db
    .select()
    .from(careRecipients)
    .where(eq(careRecipients.privateToken, token))
    .limit(1);
  return r ?? null;
}

/** Marks every untaken dose in one time slot as taken. Idempotent. */
export async function takeSlot(token: string, slotAt: string) {
  const recipient = await recipientFor(token);
  const at = new Date(slotAt);
  if (!recipient || Number.isNaN(at.getTime())) return;

  const taken = await db
    .select({ id: doseEvents.id, medicationId: doseEvents.medicationId })
    .from(doseEvents)
    .where(
      and(
        eq(doseEvents.careRecipientId, recipient.id),
        eq(doseEvents.scheduledAt, at),
        ne(doseEvents.status, "taken"),
      ),
    );
  if (taken.length === 0) return;

  await db
    .update(doseEvents)
    .set({ status: "taken", confirmedAt: new Date() })
    .where(inArray(doseEvents.id, taken.map((t) => t.id)));

  const medIds = taken.map((t) => t.medicationId);
  await db
    .update(medications)
    // Unknown counts (null) stay unknown; known counts never go below zero.
    .set({
      pillsLeft: sql`case when ${medications.pillsLeft} is null then null else greatest(${medications.pillsLeft} - ${medications.pillsPerDose}, 0) end`,
    })
    .where(inArray(medications.id, medIds));
  await db.insert(activity).values({
    familyId: recipient.familyId,
    kind: "dose_taken",
    message: `${recipient.name} took her ${fmtTime(at, recipient.timezone)} pills`,
  });

  revalidatePath(`/r/${token}`);
  revalidatePath("/app", "layout");
}

const MOOD_WORD: Record<number, string> = { 1: "not well", 2: "okay", 3: "good" };

export async function checkIn(token: string, mood: number) {
  const recipient = await recipientFor(token);
  if (!recipient || ![1, 2, 3].includes(mood)) return;
  await db.insert(checkIns).values({ careRecipientId: recipient.id, mood });
  await db.insert(activity).values({
    familyId: recipient.familyId,
    kind: "check_in",
    message: `${recipient.name} is feeling ${MOOD_WORD[mood]}`,
  });
  revalidatePath(`/r/${token}`);
  revalidatePath("/app", "layout");
}
