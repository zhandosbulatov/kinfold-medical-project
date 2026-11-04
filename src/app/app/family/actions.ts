"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { activity, members, tasks } from "@/db/schema";
import { getDemoFamily } from "@/lib/data/family";

// Demo-only, unauthenticated by design (one shared demo family). Every action
// still checks that the row belongs to that family before touching it.
// The demo viewer is Anna, the organizer.

async function context() {
  const demo = await getDemoFamily();
  if (!demo) throw new Error("Demo family missing. Reset the demo.");
  const [organizer] = await db
    .select()
    .from(members)
    .where(and(eq(members.familyId, demo.family.id), eq(members.role, "organizer")))
    .limit(1);
  return { familyId: demo.family.id, organizer };
}

async function familyTask(taskId: string, familyId: string) {
  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.familyId, familyId)))
    .limit(1);
  return task ?? null;
}

export async function addTask(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim().slice(0, 120);
  const assignee = String(formData.get("assignee") ?? "");
  if (!title) return;
  const { familyId, organizer } = await context();

  // Only accept an assignee from this family.
  const [member] = assignee
    ? await db
        .select({ id: members.id, name: members.name })
        .from(members)
        .where(and(eq(members.id, assignee), eq(members.familyId, familyId)))
        .limit(1)
    : [];

  await db.insert(tasks).values({
    familyId,
    title,
    assigneeMemberId: member?.id ?? null,
    createdByMemberId: organizer?.id ?? null,
  });
  await db.insert(activity).values({
    familyId,
    actorMemberId: organizer?.id ?? null,
    kind: "task_added",
    message: `${organizer?.name ?? "Anna"} added “${title}”${member ? ` for ${member.name}` : ""}`,
  });
  revalidatePath("/app", "layout");
}

export async function claimTask(taskId: string) {
  const { familyId, organizer } = await context();
  const task = await familyTask(taskId, familyId);
  if (!task || !organizer || task.status === "done") return;
  await db.update(tasks).set({ assigneeMemberId: organizer.id }).where(eq(tasks.id, task.id));
  await db.insert(activity).values({
    familyId,
    actorMemberId: organizer.id,
    kind: "task_claimed",
    message: `${organizer.name} took “${task.title}”`,
  });
  revalidatePath("/app", "layout");
}

export async function completeTask(taskId: string) {
  const { familyId, organizer } = await context();
  const task = await familyTask(taskId, familyId);
  if (!task || task.status === "done") return;
  await db
    .update(tasks)
    .set({ status: "done", completedAt: new Date() })
    .where(eq(tasks.id, task.id));
  await db.insert(activity).values({
    familyId,
    actorMemberId: organizer?.id ?? null,
    kind: "task_done",
    message: `${organizer?.name ?? "Anna"} marked “${task.title}” done`,
  });
  revalidatePath("/app", "layout");
}
