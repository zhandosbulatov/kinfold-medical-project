"use client";

import { createContext, use, useActionState, useId, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { ReviewField } from "@/lib/simulated-label-reader";
import { saveMedication } from "./actions";

/**
 * Review-before-save card (compound component):
 *
 *   <MedReview source="photo" flag={{ field: "times", note: "…" }}>
 *     <MedReview.Flag />
 *     <MedReview.Field name="name" label="Medication" defaultValue="Amlodipine" />
 *     <MedReview.Times defaultValue={["08:00"]} />
 *     <MedReview.Actions onCancel={…} />
 *   </MedReview>
 *
 * The flagged field is highlighted wherever it's rendered; nothing is saved
 * until the person ticks "I checked this against the label".
 */

type Flag = { field: ReviewField; note: string } | null;
const ReviewContext = createContext<{ flag: Flag } | null>(null);

function useReview() {
  const ctx = use(ReviewContext);
  if (!ctx) throw new Error("MedReview parts must be inside <MedReview>");
  return ctx;
}

function Root({
  source,
  flag = null,
  title,
  children,
}: {
  source: "photo" | "manual";
  flag?: Flag;
  title: string;
  children: ReactNode;
}) {
  const [state, action] = useActionState(saveMedication, null);
  return (
    <ReviewContext value={{ flag }}>
      <form action={action} className="rounded-card border-2 border-ink bg-surface p-4 sm:p-5">
        <h2 className="display text-2xl">{title}</h2>
        <input type="hidden" name="source" value={source} />
        <div className="mt-4 space-y-4">{children}</div>
        {state?.error ? (
          <p role="alert" className="mt-4 rounded-label bg-missed-soft p-3 font-semibold text-missed-ink">
            {state.error}
          </p>
        ) : null}
      </form>
    </ReviewContext>
  );
}

function fieldBox(flagged: boolean) {
  return flagged ? "-mx-2 rounded-label bg-due-soft p-2 ring-2 ring-due" : "";
}

function Field({
  name,
  label,
  defaultValue,
  type = "text",
  placeholder,
  required = false,
  inputMode,
}: {
  name: Exclude<ReviewField, "times">;
  label: string;
  defaultValue?: string | number | null;
  type?: "text" | "number" | "date";
  placeholder?: string;
  required?: boolean;
  inputMode?: "numeric" | "text";
}) {
  const { flag } = useReview();
  const id = useId();
  const flagged = flag?.field === name;
  return (
    <div className={fieldBox(flagged)}>
      <label htmlFor={id} className="block font-semibold">
        {label}
        {flagged ? <span className="ml-2 text-sm text-due-ink">Check this</span> : null}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        required={required}
        min={type === "number" ? 0 : undefined}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="mt-1 block min-h-12 w-full rounded-label border-2 border-line bg-surface px-3 text-lg placeholder:text-ink-muted/70 focus-visible:border-ink"
      />
    </div>
  );
}

/** Up to three dose times. Empty boxes are ignored on save. */
function Times({ defaultValue = [] }: { defaultValue?: string[] }) {
  const { flag } = useReview();
  const flagged = flag?.field === "times";
  const slots = [0, 1, 2].map((i) => defaultValue[i] ?? "");
  return (
    <fieldset className={fieldBox(flagged)}>
      <legend className="font-semibold">
        When she takes it
        {flagged ? <span className="ml-2 text-sm text-due-ink">Check this</span> : null}
      </legend>
      <div className="mt-1 grid grid-cols-3 gap-2">
        {slots.map((t, i) => (
          <label key={i} className="block">
            <span className="sr-only">Time {i + 1}</span>
            <input
              type="time"
              name="time"
              defaultValue={t}
              required={i === 0}
              className="block min-h-12 w-full rounded-label border-2 border-line bg-surface px-2 text-lg focus-visible:border-ink"
            />
          </label>
        ))}
      </div>
      <p className="mt-1 text-sm text-ink-muted">Leave extra boxes empty if she takes it fewer times.</p>
    </fieldset>
  );
}

/** The reader's one uncertainty, said plainly at the top of the card. */
function Flag() {
  const { flag } = useReview();
  return flag ? (
    <p className="rounded-label bg-due-soft p-3">
      <strong className="label-caps block text-sm text-due-ink">Check this</strong>
      {flag.note}
    </p>
  ) : null;
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="inline-flex min-h-12 items-center rounded-label bg-ink px-6 font-semibold text-surface transition-[background-color,transform] duration-150 hover:bg-ink/85 active:translate-y-px disabled:bg-ink/60"
    >
      {pending ? "Saving…" : "Save medication"}
    </button>
  );
}

function Actions({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="space-y-4 border-t border-line pt-4">
      <p className="text-ink-muted">
        Check these against the label. Kinfold doesn’t give medical advice; ask her pharmacist about
        doses.
      </p>
      <label className="flex min-h-11 cursor-pointer items-start gap-3">
        <input type="checkbox" name="checked" required className="mt-1 size-5 shrink-0 accent-ink" />
        <span>I checked these against the label</span>
      </label>
      <div className="flex flex-wrap gap-3">
        <SaveButton />
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-12 items-center rounded-label border-2 border-ink px-5 font-semibold transition-[background-color] duration-150 hover:bg-ink/10"
        >
          Start over
        </button>
      </div>
    </div>
  );
}

// Dot-notation is fine here because only client components compose it
// (a Server Component couldn't read `MedReview.Field` off a client reference).
export const MedReview = Object.assign(Root, { Field, Times, Flag, Actions });
