"use client";

import Image from "next/image";
import { startTransition, useRef, useState, ViewTransition } from "react";
import {
  readLabel,
  READING_STAGES,
  SAMPLE_BOTTLES,
  type LabelReading,
} from "@/lib/simulated-label-reader";
import { MedReview } from "./med-review";

type Photo = { src: string; alt: string; sampleId?: string };
type Step =
  | { kind: "choose" }
  | { kind: "reading"; photo: Photo; stage: number }
  | { kind: "review"; photo: Photo; reading: LabelReading }
  | { kind: "typed" };

const STAGE_MS = 600;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isoDayPlus(days: number) {
  const d = new Date(Date.now() + days * 86_400_000);
  return d.toISOString().slice(0, 10);
}

export function AddMedication({ existingNames }: { existingNames: string[] }) {
  const [step, setStep] = useState<Step>({ kind: "choose" });
  const objectUrl = useRef<string | null>(null);
  const run = useRef(0);

  function go(next: Step) {
    startTransition(() => setStep(next));
  }

  async function read(photo: Photo) {
    const id = ++run.current;
    for (let stage = 0; stage < READING_STAGES.length; stage++) {
      if (run.current !== id) return; // "Start over" pressed mid-read
      go({ kind: "reading", photo, stage });
      await wait(STAGE_MS);
    }
    if (run.current !== id) return;
    go({ kind: "review", photo, reading: readLabel({ sampleId: photo.sampleId, existingNames }) });
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file);
    void read({ src: objectUrl.current, alt: "Your photo of the pill bottle" });
  }

  function reset() {
    run.current++;
    go({ kind: "choose" });
  }

  return (
    <div className="mt-6">
      {step.kind === "choose" ? (
        <ViewTransition key="choose" enter="fade-in" exit="fade-out" default="none">
          <div>
            <section aria-labelledby="snap-title" className="rounded-card border-2 border-ink bg-surface p-4 sm:p-5">
              <h2 id="snap-title" className="display text-2xl">
                Snap the pill bottle
              </h2>
              <p className="mt-2 text-ink-muted">
                Photograph the printed label. Kinfold reads the name, dose and schedule for you to check.
              </p>
              <label className="mt-4 flex min-h-14 cursor-pointer items-center justify-center rounded-label bg-ink px-5 text-lg font-semibold text-surface transition-[background-color] duration-150 hover:bg-ink/85 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-focus">
                Take or choose a photo
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={(e) => onFile(e.currentTarget.files?.[0])}
                />
              </label>

              <p className="mt-6 font-semibold">Or try a sample bottle</p>
              <ul className="mt-2 grid grid-cols-3 gap-2">
                {SAMPLE_BOTTLES.map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => void read({ src: b.src, alt: b.label, sampleId: b.id })}
                      className="block w-full overflow-hidden rounded-label border-2 border-line transition-[border-color] duration-150 hover:border-ink"
                    >
                      <Image src={b.src} alt={b.label} width={360} height={440} unoptimized className="h-auto w-full" />
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-ink-muted">
                Demo: label reading is simulated. Each photo returns a sample result for you to check.
              </p>
            </section>

            <button
              type="button"
              onClick={() => go({ kind: "typed" })}
              className="mt-6 min-h-11 font-semibold underline underline-offset-4"
            >
              No photo? Type it in instead
            </button>
          </div>
        </ViewTransition>
      ) : null}

      {step.kind === "reading" ? (
        <ViewTransition key="reading" enter="fade-in" exit="slide-down" default="none">
          <div role="status" className="rounded-card border-2 border-ink bg-surface p-4 sm:p-5">
            <PhotoPreview photo={step.photo} />
            <ol className="mt-4 space-y-2 text-lg">
              {READING_STAGES.map((label, i) => (
                <li key={label} className={i <= step.stage ? "text-ink" : "text-ink-muted/60"}>
                  <span aria-hidden className="inline-block w-6">
                    {i < step.stage ? "✓" : i === step.stage ? "…" : ""}
                  </span>
                  {label}
                </li>
              ))}
            </ol>
          </div>
        </ViewTransition>
      ) : null}

      {step.kind === "review" ? (
        <ViewTransition key="review" enter="slide-up" exit="fade-out" default="none">
          <div className="space-y-4">
            <PhotoPreview photo={step.photo} />
            <MedReview source="photo" flag={step.reading.flag} title="Check what Kinfold read">
              <MedReview.Flag />
              <MedReview.Field name="name" label="Medication" defaultValue={step.reading.name} required />
              <div className="grid grid-cols-2 gap-3">
                <MedReview.Field name="strength" label="Strength" defaultValue={step.reading.strength} />
                <MedReview.Field name="dose" label="Each dose" defaultValue={step.reading.dose} />
              </div>
              <MedReview.Times defaultValue={step.reading.times} />
              <MedReview.Field name="instructions" label="Directions" defaultValue={step.reading.instructions} />
              <div className="grid grid-cols-2 gap-3">
                <MedReview.Field
                  name="quantity"
                  label="Pills on hand"
                  type="number"
                  inputMode="numeric"
                  defaultValue={step.reading.quantity}
                />
                <MedReview.Field
                  name="refillDate"
                  label="Refill by"
                  type="date"
                  defaultValue={step.reading.refillInDays ? isoDayPlus(step.reading.refillInDays) : ""}
                />
              </div>
              <MedReview.Actions onCancel={reset} />
            </MedReview>
          </div>
        </ViewTransition>
      ) : null}

      {step.kind === "typed" ? (
        <ViewTransition key="typed" enter="slide-up" exit="fade-out" default="none">
          <div>
            <MedReview source="manual" title="Type in a medication">
              <MedReview.Field name="name" label="Medication" placeholder="Metformin…" required />
              <div className="grid grid-cols-2 gap-3">
                <MedReview.Field name="strength" label="Strength" placeholder="500 mg…" />
                <MedReview.Field name="dose" label="Each dose" placeholder="1 tablet…" />
              </div>
              <MedReview.Times />
              <MedReview.Field name="quantity" label="Pills on hand" type="number" inputMode="numeric" />
              <MedReview.Actions onCancel={reset} />
            </MedReview>
          </div>
        </ViewTransition>
      ) : null}
    </div>
  );
}

function PhotoPreview({ photo }: { photo: Photo }) {
  return (
    <div className="mx-auto w-40 overflow-hidden rounded-label border border-line">
      {/* Uploaded photos are local blob: URLs, so a plain img is the right element here. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.src} alt={photo.alt} width={160} height={196} className="h-auto w-full object-cover" />
    </div>
  );
}
