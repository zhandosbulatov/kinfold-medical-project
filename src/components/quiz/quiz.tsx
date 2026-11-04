"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addTransitionType,
  createContext,
  startTransition,
  use,
  useEffect,
  useRef,
  useState,
  ViewTransition,
  type ReactNode,
} from "react";
import {
  answersToSearch,
  displayName,
  optionsFor,
  STEPS,
  type Answers,
  type ChoiceId,
  type QuizStep,
} from "@/lib/quiz";

// ── State ──────────────────────────────────────────────────────────────
const STORAGE_KEY = "kinfold.quiz";
const STORAGE_VERSION = 1;

type Saved = { v: number; answers: Answers; index: number };

function save(answers: Answers, index: number) {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ v: STORAGE_VERSION, answers, index } satisfies Saved),
    );
  } catch {
    // Private mode / storage blocked: the quiz still works, it just won't survive a refresh.
  }
}

function load(): Saved | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Saved;
    return saved.v === STORAGE_VERSION ? saved : null;
  } catch {
    return null;
  }
}

type QuizContextValue = {
  state: { answers: Answers; index: number; step: QuizStep; name: string };
  actions: {
    choose: (id: ChoiceId, value: string) => void;
    setName: (name: string) => void;
    next: () => void;
    back: () => void;
  };
  meta: {
    total: number;
    /** True once the person has moved between steps (drives focus management). */
    navigated: React.RefObject<boolean>;
  };
};

const QuizContext = createContext<QuizContextValue | null>(null);

function useQuiz() {
  const ctx = use(QuizContext);
  if (!ctx) throw new Error("Quiz parts must be rendered inside <Quiz>");
  return ctx;
}

/** Provider: the only place that knows answers live in React state + sessionStorage. */
function QuizRoot({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const navigated = useRef(false);

  // Restore an in-progress quiz after a refresh (sessionStorage is client-only).
  useEffect(() => {
    const saved = load();
    if (!saved) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from an external store
    setAnswers(saved.answers);
    setIndex(Math.min(saved.index, STEPS.length - 1));
  }, []);

  function go(nextAnswers: Answers, nextIndex: number, type: "quiz-forward" | "quiz-back") {
    navigated.current = true;
    save(nextAnswers, nextIndex);
    startTransition(() => {
      addTransitionType(type);
      setAnswers(nextAnswers);
      setIndex(nextIndex);
    });
  }

  function forward(nextAnswers: Answers) {
    if (index < STEPS.length - 1) {
      go(nextAnswers, index + 1, "quiz-forward");
      return;
    }
    // Finished: keep answers for "Change my answers", restart at step 1, show the plan.
    save(nextAnswers, 0);
    router.push(`/quiz/result?${answersToSearch(nextAnswers)}`, {
      transitionTypes: ["nav-forward"],
    });
  }

  const value: QuizContextValue = {
    state: { answers, index, step: STEPS[index], name: displayName(answers) },
    actions: {
      choose: (id, v) => forward({ ...answers, [id]: v }),
      setName: (name) => forward({ ...answers, name: name.trim() }),
      next: () => forward(answers),
      back: () => {
        if (index > 0) go(answers, index - 1, "quiz-back");
      },
    },
    meta: { total: STEPS.length, navigated },
  };

  return <QuizContext value={value}>{children}</QuizContext>;
}

// ── Chrome ─────────────────────────────────────────────────────────────
function Back() {
  const { state, actions } = useQuiz();
  const cls =
    "inline-flex min-h-11 items-center gap-1.5 rounded-label px-2 -ml-2 font-semibold " +
    "transition-[background-color] duration-150 hover:bg-ink/5";
  return state.index === 0 ? (
    <Link href="/" className={cls}>
      <span aria-hidden>←</span> Home
    </Link>
  ) : (
    <button type="button" onClick={actions.back} className={cls}>
      <span aria-hidden>←</span> Back
    </button>
  );
}

function Progress() {
  const { state, meta } = useQuiz();
  const done = state.index + 1;
  return (
    <div>
      <p className="label-caps text-sm text-ink-muted">
        Step {done} of {meta.total}
      </p>
      <div
        role="progressbar"
        aria-label="Quiz progress"
        aria-valuemin={1}
        aria-valuemax={meta.total}
        aria-valuenow={done}
        className="mt-2 h-2 overflow-hidden rounded-label bg-line"
      >
        <div
          className="h-full origin-left bg-brand transition-transform duration-300 ease-out"
          style={{ transform: `scaleX(${done / meta.total})` }}
        />
      </div>
    </div>
  );
}

// ── Steps ──────────────────────────────────────────────────────────────
/** The current screen. Keyed so each step enters/exits directionally. */
function Step() {
  const { state } = useQuiz();
  const step = state.step;
  return (
    <ViewTransition
      key={step.id}
      default="none"
      enter={{ "quiz-forward": "slide-from-right", "quiz-back": "slide-from-left", default: "none" }}
      exit={{ "quiz-forward": "slide-to-left", "quiz-back": "slide-to-right", default: "none" }}
    >
      <section aria-labelledby="quiz-question" className="pt-8 pb-16 md:pt-12">
        {step.kind === "choice" ? (
          <>
            <Question>{step.question(state.name)}</Question>
            {step.hint ? <p className="mt-2 text-ink-muted">{step.hint}</p> : null}
            <Options id={step.id} />
          </>
        ) : step.kind === "name" ? (
          <NameField question={step.question} hint={step.hint} />
        ) : (
          <Teaser id={step.id} />
        )}
      </section>
    </ViewTransition>
  );
}

/** Step heading. Takes focus after a step change so screen readers hear the new question. */
function Question({ children }: { children: ReactNode }) {
  const { meta } = useQuiz();
  return (
    <h1
      id="quiz-question"
      tabIndex={-1}
      ref={(el) => {
        if (el && meta.navigated.current) el.focus({ preventScroll: true });
      }}
      className="display text-2xl outline-none md:text-3xl"
    >
      {children}
    </h1>
  );
}

function Options({ id }: { id: ChoiceId }) {
  const { state, actions } = useQuiz();
  const selected = state.answers[id];
  return (
    <ul className="mt-8 space-y-3">
      {optionsFor(id).map(([value, label]) => {
        const isSelected = selected === value;
        return (
          <li key={value}>
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => actions.choose(id, value)}
              className={
                "flex min-h-14 w-full items-center justify-between gap-3 rounded-label border-2 px-4 py-3 text-left text-lg " +
                "transition-[border-color,background-color] duration-150 active:translate-y-px " +
                (isSelected
                  ? "border-ink bg-brand-soft font-semibold"
                  : "border-line bg-surface hover:border-ink")
              }
            >
              {label}
              {isSelected ? <span aria-hidden>✓</span> : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function NameField({ question, hint }: { question: string; hint: string }) {
  const { state, actions } = useQuiz();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const name = new FormData(e.currentTarget).get("parentName");
        actions.setName(typeof name === "string" ? name : "");
      }}
    >
      <Question>
        <label htmlFor="parentName">{question}</label>
      </Question>
      <p className="mt-2 text-ink-muted">{hint}</p>
      <input
        id="parentName"
        name="parentName"
        type="text"
        autoComplete="off"
        spellCheck={false}
        maxLength={24}
        defaultValue={state.answers.name ?? ""}
        placeholder="Mom, Rose, Grandma…"
        className="mt-8 block min-h-14 w-full rounded-label border-2 border-line bg-surface px-4 text-lg placeholder:text-ink-muted/70 focus-visible:border-ink"
      />
      <p className="mt-2 text-sm text-ink-muted">Leave it empty to use “Mom”.</p>
      <Continue />
    </form>
  );
}

function Continue({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      className="mt-8 inline-flex min-h-12 items-center rounded-label bg-ink px-6 font-semibold text-surface transition-[background-color,transform] duration-150 hover:bg-ink/85 active:translate-y-px"
    >
      Continue
    </button>
  );
}

const TEASER_SOURCE =
  "https://www.aarp.org/press/releases/2025-07-24-new-report-reveals-crisis-point-for-americas-63-million-family-caregivers.html";

function Teaser({ id }: { id: "teaser-scale" | "teaser-chat" }) {
  const { state, actions } = useQuiz();
  if (id === "teaser-scale") {
    return (
      <>
        <p className="label-caps inline-block rounded-label bg-sticker-yellow px-2.5 py-1 text-sm">
          You’re not the only one
        </p>
        <Question>63 million Americans care for a relative.</Question>
        <p className="mt-4 max-w-[46ch] text-lg">
          6 in 10 of them also hold a job. Most are fitting pill checks and refill runs around
          work, like you.
        </p>
        <p className="mt-3 text-sm text-ink-muted">
          Source:{" "}
          <a
            href={TEASER_SOURCE}
            target="_blank"
            rel="noreferrer"
            className="text-brand-ink underline underline-offset-2"
          >
            AARP &amp; National Alliance for Caregiving, 2025
          </a>
        </p>
        <Continue onClick={actions.next} />
      </>
    );
  }
  return (
    <>
      <p className="label-caps inline-block rounded-label bg-sticker-green px-2.5 py-1 text-sm">
        One list, not a group chat
      </p>
      <Question>Everyone sees the same day.</Question>
      <p className="mt-4 max-w-[46ch] text-lg">
        In a group chat, “Did {state.name} take her pills?” gets buried under photos and plans.
        Kinfold keeps one list where every dose shows as taken, due or missed.
      </p>
      <ul className="mt-6 max-w-sm divide-y divide-line rounded-label border border-line bg-surface px-4">
        <li className="flex justify-between py-2.5">
          Lisinopril, 8:00 AM <span className="font-semibold text-taken-ink">✓ Taken</span>
        </li>
        <li className="flex justify-between py-2.5">
          Metformin, 8:00 PM <span className="font-semibold text-missed-ink">× Missed</span>
        </li>
        <li className="flex justify-between py-2.5">
          Atorvastatin, 9:00 PM <span className="font-semibold text-due-ink">○ Due</span>
        </li>
      </ul>
      <Continue onClick={actions.next} />
    </>
  );
}

// Named exports, not `Quiz.Back` dot-notation: Server Components can't read
// properties off a client module reference.
export { QuizRoot as Quiz, Back as QuizBack, Progress as QuizProgress, Step as QuizStep };
