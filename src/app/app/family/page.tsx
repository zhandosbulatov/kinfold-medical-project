import { Suspense, ViewTransition } from "react";
import { AppPage, Panel, Skeleton } from "@/components/app/app-page";
import { CopyLink } from "@/components/app/copy-link";
import { getFamilyView } from "@/lib/data/app";
import { getDemoFamily } from "@/lib/data/family";
import { fmtDay, fmtRelative } from "@/lib/format";
import { addTask } from "./actions";
import { TaskBoard, type TaskItem } from "./task-board";

export const metadata = { title: "Family" };

export default function FamilyPage() {
  return (
    <AppPage title="Family">
      <Suspense fallback={<Skeleton lines={5} />}>
        <FamilyContent />
      </Suspense>
    </AppPage>
  );
}

async function FamilyContent() {
  const demo = await getDemoFamily();
  if (!demo) return null;
  const tz = demo.recipient.timezone;
  const view = await getFamilyView(demo.family.id);
  const joined = view.people.filter((p) => p.joinedAt).length;
  const me = view.people.find((p) => p.role === "organizer")?.name ?? "Anna";

  // Only the fields the client list needs, pre-formatted on the server.
  const taskItems: TaskItem[] = view.tasks.map((t) => ({
    id: t.id,
    title: t.title,
    done: t.status === "done",
    assigneeName: t.assigneeName,
    dueLabel: t.dueDate ? fmtDay(new Date(`${t.dueDate}T12:00:00Z`), tz) : null,
  }));

  return (
    <>
      <Panel title={`${demo.recipient.name}’s circle`}>
        <div className="rounded-label border border-line bg-surface p-4">
          <p className="font-semibold">
            {joined} of {view.people.length} joined
          </p>
          <div
            role="progressbar"
            aria-label="Care circle joined"
            aria-valuemin={0}
            aria-valuemax={view.people.length}
            aria-valuenow={joined}
            className="mt-2 h-2 overflow-hidden rounded-label bg-line"
          >
            <div
              className="h-full origin-left bg-brand transition-transform duration-300 ease-out"
              style={{ transform: `scaleX(${view.people.length ? joined / view.people.length : 0})` }}
            />
          </div>
          <ul className="mt-4 divide-y divide-line">
            {view.people.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-lg font-semibold">
                    {p.name}
                    {p.role === "organizer" ? <span className="font-normal text-ink-muted"> (you)</span> : null}
                  </p>
                  <p className="text-sm text-ink-muted">
                    {p.joinedAt ? `Joined ${fmtRelative(p.joinedAt, view.now)}` : "Invited, not joined yet"}
                  </p>
                </div>
                {p.joinedAt ? (
                  <span className="font-semibold text-taken-ink">✓ In</span>
                ) : (
                  <CopyLink path={`/join/${p.inviteToken}`} label="Copy invite" />
                )}
              </li>
            ))}
          </ul>
        </div>
      </Panel>

      <Panel title="Tasks">
        <TaskBoard tasks={taskItems} me={me} />
        <form action={addTask} className="mt-4 rounded-label border border-dashed border-line p-3">
          <label htmlFor="task-title" className="font-semibold">
            Add a task
          </label>
          <input
            id="task-title"
            name="title"
            required
            maxLength={120}
            autoComplete="off"
            placeholder="Pick up the Metformin refill…"
            className="mt-2 block min-h-12 w-full rounded-label border-2 border-line bg-surface px-3 placeholder:text-ink-muted/70 focus-visible:border-ink"
          />
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="task-assignee" className="block text-sm text-ink-muted">
                Who’s doing it
              </label>
              <select
                id="task-assignee"
                name="assignee"
                defaultValue=""
                className="mt-1 min-h-12 rounded-label border-2 border-line bg-surface px-3 text-ink"
              >
                <option value="">Nobody yet</option>
                {view.people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <button className="min-h-12 rounded-label bg-ink px-5 font-semibold text-surface transition-[background-color] duration-150 hover:bg-ink/85">
              Add task
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Activity">
        {view.feed.length === 0 ? (
          <p className="text-ink-muted">Nothing yet.</p>
        ) : (
          <ol className="divide-y divide-line rounded-label border border-line bg-surface px-4">
            {view.feed.map((a) => (
              <ViewTransition key={a.id}>
                <li className="py-3">
                  <p>{a.message}</p>
                  <p className="text-sm text-ink-muted">{fmtRelative(a.createdAt, view.now)}</p>
                </li>
              </ViewTransition>
            ))}
          </ol>
        )}
      </Panel>
    </>
  );
}
