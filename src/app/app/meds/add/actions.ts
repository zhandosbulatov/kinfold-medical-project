"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { activity, doseEvents, medications, members } from "@/db/schema";
import { getDemoFamily } from "@/lib/data/family";
import { localDay, zonedToUtc } from "@/lib/time";

export type SaveState = { error: string } | null;

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function text(fd: FormData, key: string, max: number) {
  return String(fd.get(key) ?? "").trim().slice(0, max);
}

/**
 * Saves a reviewed medication for the demo family's recipient, then creates
 * today's remaining doses and tomorrow's. Requires the explicit "I checked
 * this against the label" confirmation.
 */
export async function saveMedication(_prev: SaveState, fd: FormData): Promise<SaveState> {
  if (fd.get("checked") !== "on") {
    return { error: "Check each field against the label, then tick the box to confirm." };
  }
  const name = text(fd, "name", 60);
  if (!name) return { error: "Add the medication name." };

  const times = [
    ...new Set(
      fd
        .getAll("time")
        .map((t) => String(t))
        .filter((t) => TIME.test(t)),
    ),
  ].sort();
  if (times.length === 0) return { error: "Add at least one time she takes it." };

  const qtyRaw = text(fd, "quantity", 6);
  const quantity = qtyRaw === "" ? null : Number(qtyRaw);
  if (quantity !== null && (!Number.isInteger(quantity) || quantity < 0 || quantity > 2000)) {
    return { error: "Pills on hand should be a whole number." };
  }
  const refill = text(fd, "refillDate", 10);
  const source = fd.get("source") === "photo" ? "photo" : "manual";

  const demo = await getDemoFamily();
  if (!demo) return { error: "The demo family is missing. Reset the demo and try again." };
  const { family, recipient } = demo;
  const tz = recipient.timezone;

  const [med] = await db
    .insert(medications)
    .values({
      careRecipientId: recipient.id,
      name,
      strength: text(fd, "strength", 30) || null,
      dose: text(fd, "dose", 30) || null,
      scheduleTimes: times,
      instructions: text(fd, "instructions", 120) || null,
      pillsLeft: quantity,
      refillDate: DATE.test(refill) ? refill : null,
      source,
    })
    .returning();

  // Doses: what's still ahead today, plus all of tomorrow.
  const now = new Date();
  const rows = [0, 1].flatMap((offset) =>
    times
      .map((t) => zonedToUtc(localDay(tz, now, offset), t, tz))
      .filter((at) => at.getTime() > now.getTime())
      .map((scheduledAt) => ({ medicationId: med.id, careRecipientId: recipient.id, scheduledAt })),
  );
  if (rows.length > 0) await db.insert(doseEvents).values(rows);

  const [organizer] = await db
    .select({ id: members.id, name: members.name })
    .from(members)
    .where(and(eq(members.familyId, family.id), eq(members.role, "organizer")))
    .limit(1);
  await db.insert(activity).values({
    familyId: family.id,
    actorMemberId: organizer?.id ?? null,
    kind: "med_added",
    message: `${organizer?.name ?? "Anna"} added ${name}${source === "photo" ? " from a bottle photo" : ""}`,
  });

  revalidatePath("/app", "layout");
  revalidatePath(`/r/${recipient.privateToken}`);
  redirect("/app/meds");
}
