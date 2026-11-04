/**
 * Quiz content, answer model and the care-plan builder.
 * Pure data + functions: shared by the client quiz and the server result page.
 */

export const QUESTION_IDS = [
  "situation",
  "name",
  "age",
  "meds",
  "alone",
  "helpers",
  "worry",
  "phone",
] as const;

export type QuestionId = (typeof QUESTION_IDS)[number];

const CHOICES = {
  situation: {
    hospital: "She just came home from the hospital",
    fall: "She had a fall",
    diagnosis: "She got a new diagnosis",
    gradual: "She needs a bit more help each month",
  },
  age: {
    under70: "Under 70",
    "70s": "70 to 79",
    "80s": "80 to 89",
    "90plus": "90 or older",
  },
  meds: {
    few: "1 or 2",
    some: "3 to 5",
    many: "6 or more",
    unsure: "I’m not sure",
  },
  alone: {
    alone: "Yes, she lives on her own",
    partner: "She lives with a partner",
    family: "She lives with me or another relative",
  },
  helpers: {
    solo: "Only me",
    one: "Me and one brother or sister",
    several: "Me and two or more siblings",
    other: "Me and a friend, neighbor or aide",
  },
  worry: {
    missed: "That she misses a dose",
    runout: "That she runs out of pills",
    doctor: "Not knowing what the doctor said",
    alone: "Doing all of it myself",
  },
  phone: {
    smart: "A smartphone or tablet",
    basic: "A basic cell phone",
    landline: "A landline only",
  },
} as const;

type Choices = typeof CHOICES;
export type ChoiceId = keyof Choices;

export type Answers = { [K in ChoiceId]?: keyof Choices[K] } & { name?: string };

export type QuizStep =
  | { kind: "choice"; id: ChoiceId; question: (name: string) => string; hint?: string }
  | { kind: "name"; id: "name"; question: string; hint: string }
  | { kind: "teaser"; id: "teaser-scale" | "teaser-chat" };

export const STEPS: QuizStep[] = [
  { kind: "choice", id: "situation", question: () => "What’s happening with Mom right now?" },
  {
    kind: "name",
    id: "name",
    question: "What do you call her?",
    hint: "Kinfold puts this name on her care plan.",
  },
  { kind: "choice", id: "age", question: (n) => `How old is ${n}?` },
  { kind: "teaser", id: "teaser-scale" },
  {
    kind: "choice",
    id: "meds",
    question: (n) => `How many medications does ${n} take each day?`,
    hint: "Count pills, inhalers and injections. A guess is fine.",
  },
  { kind: "choice", id: "alone", question: () => "Does she live alone?" },
  { kind: "choice", id: "helpers", question: (n) => `Who helps with ${n}’s care?` },
  { kind: "teaser", id: "teaser-chat" },
  { kind: "choice", id: "worry", question: () => "What worries you most right now?" },
  { kind: "choice", id: "phone", question: () => "What phone does she use?" },
];

export function optionsFor(id: ChoiceId) {
  return Object.entries(CHOICES[id]) as [string, string][];
}

export function displayName(answers: Answers) {
  const n = answers.name?.trim();
  return n ? n.slice(0, 24) : "Mom";
}

// ── URL encoding for /quiz/result ──────────────────────────────────────
const PARAM: Record<QuestionId, string> = {
  situation: "s",
  name: "n",
  age: "a",
  meds: "m",
  alone: "l",
  helpers: "h",
  worry: "w",
  phone: "p",
};

export function answersToSearch(answers: Answers) {
  const sp = new URLSearchParams();
  for (const id of QUESTION_IDS) {
    const v = answers[id];
    if (v) sp.set(PARAM[id], String(v));
  }
  return sp.toString();
}

/** Parse and whitelist: anything unknown is dropped. */
export function answersFromSearch(
  sp: Record<string, string | string[] | undefined>,
): Answers {
  const get = (k: string) => {
    const v = sp[k];
    return typeof v === "string" ? v : undefined;
  };
  const out: Answers = {};
  for (const id of QUESTION_IDS) {
    const raw = get(PARAM[id]);
    if (!raw) continue;
    if (id === "name") {
      out.name = raw.replace(/[^\p{L}\p{M}' .-]/gu, "").slice(0, 24);
    } else if (raw in CHOICES[id]) {
      (out as Record<string, string>)[id] = raw;
    }
  }
  return out;
}

export function isComplete(a: Answers) {
  return Boolean(a.situation && a.meds && a.alone && a.helpers && a.worry && a.phone);
}

// ── Care plan ──────────────────────────────────────────────────────────
export type PlanLine = { label: string; text: string };
export type Plan = {
  name: string;
  opener: string;
  lines: PlanLine[];
  flags: string[];
};

export function buildPlan(a: Answers): Plan {
  const name = displayName(a);
  const isMom = name === "Mom";
  const her = isMom ? "Mom’s" : `${name}’s`;

  const opener = {
    hospital: `Discharge papers can add, stop or change medications. Start by snapping every bottle in ${her} kitchen, old and new, so the whole family works from one list.`,
    fall: `After a fall, it’s natural to want to check in more often. Kinfold shows you ${her} day without a phone call every few hours.`,
    diagnosis: `A new diagnosis often means new prescriptions. Put them on one shared list now, before the schedule gets complicated.`,
    gradual: `Set up the routine now, while the changes are small. When the next one comes, the family already works from one list.`,
  }[a.situation ?? "gradual"];

  const lines: PlanLine[] = [];

  lines.push({
    label: "Reminders",
    text: {
      few: `One reminder at each dose time, about 1 or 2 a day.`,
      some: `Morning and evening reminders, with pills grouped so ${isMom ? "she" : name} taps once per time slot.`,
      many: `A reminder at every dose time, grouped by time slot so 6 or more pills stay one tap each.`,
      unsure: `Snap each bottle first. Kinfold builds the schedule from what’s printed on the labels.`,
    }[a.meds ?? "unsure"],
  });

  lines.push({
    label: "How she confirms",
    text:
      a.phone === "smart" || !a.phone
        ? `A private link on her phone with one large “I took them” button. Add it to her home screen on your next visit.`
        : `Text-message and phone-call reminders aren’t available yet. Today the same one-button link works on any tablet you leave at her place.`,
  });

  lines.push({
    label: "Your circle",
    text: {
      solo: `You’re doing this on your own right now. Kinfold keeps the record, so handing a task to a neighbor or an aide later takes one link.`,
      one: `Invite your brother or sister. You both see the same doses, and either of you can take a task.`,
      several: `Invite your siblings. Everyone sees the same day, so nobody has to ask in the group chat.`,
      other: `Invite the friend, neighbor or aide who helps. They see the doses and tasks you share.`,
    }[a.helpers ?? "solo"],
  });

  lines.push({
    label: "Your first focus",
    text: {
      missed: `Missed-dose flags: a dose still untaken 30 minutes after its time is marked missed for the whole circle.`,
      runout: `Refill countdowns: each bottle shows how many days of pills are left, with a warning a week ahead.`,
      doctor: `Keep appointments in one place everyone can see. Doctor-visit summaries come in a later version.`,
      alone: `Shared tasks: put refills, rides and calls on one list so they stop defaulting to you.`,
    }[a.worry ?? "missed"],
  });

  const flags: string[] = [];
  if (a.alone === "alone" && (a.meds === "some" || a.meds === "many")) {
    flags.push("Lives alone · 3+ medications");
  }
  if (a.situation === "hospital") flags.push("Recent discharge");
  if (a.age === "80s" || a.age === "90plus") flags.push("Age 80+");

  return { name, opener, lines, flags };
}
