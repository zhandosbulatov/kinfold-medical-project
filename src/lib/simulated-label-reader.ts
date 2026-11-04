/**
 * SIMULATED pill-bottle label reader for the capstone demo.
 *
 * There is no AI call here. Each sample bottle in /public/demo maps to a fixed
 * result, and any uploaded photo gets the next preset the family doesn't
 * already have. The shape of `LabelReading` is what a real vision model would
 * return, so this module can be swapped for a server action later without
 * touching the UI.
 */

export type ReviewField = "name" | "strength" | "dose" | "times" | "quantity" | "refillDate" | "instructions";

export type LabelReading = {
  name: string;
  strength: string;
  dose: string;
  /** Local "HH:MM" times. Labels say "once daily", so times are a best guess to check. */
  times: string[];
  quantity: number | null;
  /** Days of supply from today, turned into a date by the UI. */
  refillInDays: number | null;
  instructions: string;
  /** The one field the reader is least sure about. */
  flag: { field: ReviewField; note: string };
};

export type SampleBottle = { id: string; label: string; src: string };

export const SAMPLE_BOTTLES: SampleBottle[] = [
  { id: "amlodipine", label: "Amlodipine bottle", src: "/demo/amlodipine.svg" },
  { id: "levothyroxine", label: "Levothyroxine bottle", src: "/demo/levothyroxine.svg" },
  { id: "donepezil", label: "Donepezil bottle", src: "/demo/donepezil.svg" },
];

const PRESETS: Record<string, LabelReading> = {
  amlodipine: {
    name: "Amlodipine",
    strength: "5 mg",
    dose: "1 tablet",
    times: ["08:00"],
    quantity: 30,
    refillInDays: 30,
    instructions: "Take once daily",
    flag: {
      field: "times",
      note: "The label says “once daily” without a time. Kinfold picked 8:00 AM. Change it to when she actually takes it.",
    },
  },
  levothyroxine: {
    name: "Levothyroxine",
    strength: "50 mcg",
    dose: "1 tablet",
    times: ["07:00"],
    quantity: 90,
    refillInDays: 90,
    instructions: "Take on an empty stomach, 30 minutes before breakfast",
    flag: {
      field: "times",
      note: "“30 minutes before breakfast” has no clock time on the label. Kinfold picked 7:00 AM. Check it against her routine.",
    },
  },
  donepezil: {
    name: "Donepezil",
    strength: "10 mg",
    dose: "1 tablet",
    times: ["21:00"],
    quantity: 30,
    refillInDays: 30,
    instructions: "Take at bedtime",
    flag: {
      field: "quantity",
      note: "The quantity was hard to read in the photo. Check the number printed on the label.",
    },
  },
};

const ORDER = SAMPLE_BOTTLES.map((b) => b.id);

/**
 * `sampleId` picks a sample bottle's result. Without it (a real upload), the
 * next preset whose medication the family doesn't have yet is returned.
 */
export function readLabel({
  sampleId,
  existingNames,
}: {
  sampleId?: string;
  existingNames: string[];
}): LabelReading {
  if (sampleId && PRESETS[sampleId]) return PRESETS[sampleId];
  const have = new Set(existingNames.map((n) => n.toLowerCase()));
  const next = ORDER.find((id) => !have.has(PRESETS[id].name.toLowerCase())) ?? ORDER[0];
  return PRESETS[next];
}

/** The staged progress shown while "reading" (purely presentational). */
export const READING_STAGES = [
  "Finding the label…",
  "Reading the medication name…",
  "Reading the dose and directions…",
] as const;
