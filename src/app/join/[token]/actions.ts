"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { activity, members } from "@/db/schema";

/** A sibling accepts their invite. Idempotent: joining twice changes nothing. */
export async function joinCircle(token: string) {
  const [member] = await db.select().from(members).where(eq(members.inviteToken, token)).limit(1);
  if (!member) redirect("/");
  if (!member.joinedAt) {
    await db.update(members).set({ joinedAt: new Date() }).where(eq(members.id, member.id));
    await db.insert(activity).values({
      familyId: member.familyId,
      actorMemberId: member.id,
      kind: "member_joined",
      message: `${member.name} joined the circle`,
    });
    revalidatePath("/app", "layout");
  }
  redirect("/app/family");
}
