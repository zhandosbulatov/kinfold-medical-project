import "server-only";
import { eq } from "drizzle-orm";
import { connection } from "next/server";
import { cache } from "react";
import { db } from "@/db";
import { careRecipients, families, members } from "@/db/schema";
import { DEMO_SLUG } from "@/lib/demo";
import { localDay, zonedToUtc } from "@/lib/time";

/**
 * MVP: no accounts. Everyone sees the one shared demo family.
 * React.cache dedupes this across every component in one request.
 *
 * Every reader here starts with `await connection()`: demo data changes on
 * every tap, so it must render at request time and never at build/prerender
 * (Cache Components would otherwise try to prerender DB reads and `new Date()`).
 */
export const getDemoFamily = cache(async () => {
  await connection();
  const rows = await db
    .select({ family: families, recipient: careRecipients })
    .from(families)
    .innerJoin(careRecipients, eq(careRecipients.familyId, families.id))
    .where(eq(families.slug, DEMO_SLUG))
    .limit(1);
  return rows[0] ?? null;
});

export const getRecipientByToken = cache(async (token: string) => {
  await connection();
  const rows = await db
    .select()
    .from(careRecipients)
    .where(eq(careRecipients.privateToken, token))
    .limit(1);
  return rows[0] ?? null;
});

export const getMemberByInviteToken = cache(async (token: string) => {
  await connection();
  const rows = await db
    .select({ member: members, family: families })
    .from(members)
    .innerJoin(families, eq(members.familyId, families.id))
    .where(eq(members.inviteToken, token))
    .limit(1);
  return rows[0] ?? null;
});

/** UTC bounds of "today" in the recipient's own timezone. */
export function todayBounds(timeZone: string, now = new Date()) {
  return {
    start: zonedToUtc(localDay(timeZone, now), "00:00", timeZone),
    end: zonedToUtc(localDay(timeZone, now, 1), "00:00", timeZone),
  };
}
