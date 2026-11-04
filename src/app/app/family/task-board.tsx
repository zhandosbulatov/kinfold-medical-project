"use client";

import { startTransition, useOptimistic, ViewTransition } from "react";
import { claimTask, completeTask } from "./actions";

export type TaskItem = {
  id: string;
  title: string;
  done: boolean;
  assigneeName: string | null;
  /** Pre-formatted on the server (timezone-correct). */
  dueLabel: string | null;
};

type Change = { id: string; type: "claim" | "done" };

/**
 * Shared task list with optimistic claim/done: the tap shows instantly, the
 * server action confirms. Rows are keyed view transitions, so a finished task
 * glides down into the done group.
 */
export function TaskBoard({ tasks, me }: { tasks: TaskItem[]; me: string }) {
  const [optimistic, apply] = useOptimistic(tasks, (state, change: Change) =>
    state.map((t) =>
      t.id !== change.id
        ? t
        : change.type === "done"
          ? { ...t, done: true }
          : { ...t, assigneeName: me },
    ),
  );

  function run(change: Change) {
    startTransition(async () => {
      apply(change);
      await (change.type === "done" ? completeTask(change.id) : claimTask(change.id));
    });
  }

  const ordered = [...optimistic].sort((a, b) => Number(a.done) - Number(b.done));

  if (ordered.length === 0) {
    return <p className="text-ink-muted">No tasks yet. Add the first one below.</p>;
  }

  return (
    <ul className="space-y-2">
      {ordered.map((t) => (
        <ViewTransition key={t.id}>
          <li
            className={
              "flex flex-wrap items-center justify-between gap-3 rounded-label border border-line p-3 " +
              (t.done ? "bg-canvas text-ink-muted" : "bg-surface")
            }
          >
            <div className="min-w-0">
              <p className={t.done ? "text-lg line-through" : "text-lg font-semibold"}>{t.title}</p>
              <p className="text-sm text-ink-muted">
                {t.done ? "Done" : t.assigneeName ? `${t.assigneeName} has this` : "Nobody yet"}
                {t.dueLabel && !t.done ? ` · due ${t.dueLabel}` : ""}
              </p>
            </div>
            {t.done ? (
              <span className="font-semibold text-taken-ink">✓</span>
            ) : (
              <div className="flex gap-2">
                {t.assigneeName !== me ? (
                  <button
                    type="button"
                    onClick={() => run({ id: t.id, type: "claim" })}
                    className="min-h-11 rounded-label border-2 border-ink px-3 text-sm font-semibold transition-[background-color] duration-150 hover:bg-ink/10"
                  >
                    I’ll do it
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => run({ id: t.id, type: "done" })}
                  className="min-h-11 rounded-label bg-ink px-3 text-sm font-semibold text-surface transition-[background-color] duration-150 hover:bg-ink/85"
                >
                  Mark done
                </button>
              </div>
            )}
          </li>
        </ViewTransition>
      ))}
    </ul>
  );
}
