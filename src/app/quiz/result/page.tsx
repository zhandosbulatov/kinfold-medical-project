import { Suspense, ViewTransition } from "react";
import { SiteHeader } from "@/components/landing/hero";
import { RxLabel } from "@/components/rx/rx-label";
import { Sticker } from "@/components/rx/sticker";
import { PrimaryLink, SecondaryLink } from "@/components/ui/link-button";
import { answersFromSearch, buildPlan, isComplete } from "@/lib/quiz";

export const metadata = {
  title: "Your care plan",
  robots: { index: false, follow: false },
};

// The "magic page": answers arrive in the URL, the plan is built on the server.
// Suspense reveal: the "Preparing…" card slides away and the plan slides up.
export default function ResultPage({ searchParams }: PageProps<"/quiz/result">) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-10 pb-20 md:pt-14">
        <Suspense
          fallback={
            <ViewTransition exit="slide-down" default="none">
              <Preparing />
            </ViewTransition>
          }
        >
          <ViewTransition enter="slide-up" default="none">
            <CarePlan searchParams={searchParams} />
          </ViewTransition>
        </Suspense>
      </main>
    </>
  );
}

function Preparing() {
  return (
    <div role="status" className="rounded-label border border-line bg-surface p-6">
      <p className="label-caps text-lg">Preparing the care plan…</p>
      <ul className="mt-3 space-y-1 font-mono text-sm text-ink-muted">
        <li>Reading your answers…</li>
        <li>Matching reminders to her medications…</li>
        <li>Setting up the family circle…</li>
      </ul>
    </div>
  );
}

async function CarePlan({ searchParams }: Pick<PageProps<"/quiz/result">, "searchParams">) {
  const answers = answersFromSearch(await searchParams);
  if (!isComplete(answers)) return <Incomplete />;

  // A short, deliberate beat so the plan reads as prepared for this family.
  await new Promise((r) => setTimeout(r, 900));
  const plan = buildPlan(answers);

  return (
    <article aria-labelledby="plan-title">
      <h1 id="plan-title" className="display text-3xl md:text-4xl">
        {plan.name}’s care plan
      </h1>
      <p className="mt-4 max-w-[52ch] text-lg">{plan.opener}</p>
      {plan.flags.length > 0 ? (
        <ul aria-label="Noted from your answers" className="mt-5 flex flex-wrap gap-2">
          {plan.flags.map((f) => (
            <li key={f}>
              <Sticker tone="yellow">{f}</Sticker>
            </li>
          ))}
        </ul>
      ) : null}

      <RxLabel on="counter" className="mt-8">
        <RxLabel.Header rx="PLAN 0001" pharmacy="Kinfold" />
        <RxLabel.Patient>For {plan.name} and family</RxLabel.Patient>
        <dl className="mt-2">
          {plan.lines.map((line) => (
            <div
              key={line.label}
              className="grid gap-1 border-t border-line py-4 first:border-t-0 sm:grid-cols-[10rem_1fr] sm:gap-6"
            >
              <dt className="label-caps text-base text-brand-ink">{line.label}</dt>
              <dd className="text-lg leading-snug">{line.text}</dd>
            </div>
          ))}
        </dl>
      </RxLabel>

      <section aria-labelledby="next-title" className="mt-12">
        <h2 id="next-title" className="display text-2xl">
          See the plan working
        </h2>
        <p className="mt-2 max-w-[52ch] text-lg text-ink-muted">
          The demo opens a sample family: Rose, her daughter Anna and her son Ben, with a week of
          doses already recorded.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <PrimaryLink href="/app">See it in action</PrimaryLink>
          <SecondaryLink href="/quiz">Change my answers</SecondaryLink>
        </div>
      </section>

      <p className="mt-12 max-w-[60ch] border-t border-line pt-4 text-sm text-ink-muted">
        Kinfold doesn’t give medical advice. Check every schedule against the label, and ask her
        pharmacist about doses.
      </p>
    </article>
  );
}

function Incomplete() {
  return (
    <div>
      <h1 className="display text-3xl">This plan is missing some answers</h1>
      <p className="mt-3 max-w-[48ch] text-lg">
        Take the 2-minute check to build a care plan, or open the demo to look around first.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <PrimaryLink href="/quiz">Take the 2-minute check</PrimaryLink>
        <SecondaryLink href="/app">See the demo</SecondaryLink>
      </div>
    </div>
  );
}
