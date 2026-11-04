import type { ReactNode } from "react";
import { Sticker } from "@/components/rx/sticker";
import { FamilyTodayMock, LabelReadMock, RoseScreenMock } from "./product-mocks";

export function HowItWorks() {
  return (
    <section aria-labelledby="how-title" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
      <h2 id="how-title" className="display text-2xl md:text-3xl">
        How Kinfold works
      </h2>
      <p className="mt-3 max-w-[52ch] text-lg text-ink-muted">
        You set it up once from your phone. Mom does one thing: she taps a button when she takes
        her pills.
      </p>

      <ol className="mt-14 space-y-20 md:mt-20 md:space-y-28">
        <Step
          n={1}
          title="Snap the pill bottle. Kinfold reads the label."
          visual={<LabelReadMock />}
        >
          Take a photo of each bottle. Kinfold pulls out the drug name, the strength and the
          schedule, then asks you to check them against the label before anything is saved.
        </Step>
        <Step n={2} title="Mom taps one large button." visual={<RoseScreenMock />} layout="visual-first">
          Rose gets a private link: no account, no password, no app to learn. It shows the pills
          due now, one large “I took them” button and a way to call you.
          <span className="mt-4 block">
            <Sticker tone="yellow">Mom sets up nothing</Sticker>
          </span>
        </Step>
        <Step
          n={3}
          title="Your whole family sees the same day."
          visual={<FamilyTodayMock />}
        >
          You and your siblings see each dose as taken, due or missed. A dose still untaken 30
          minutes after its time is flagged, so a missed pill turns into one phone call instead of
          a week of guessing.
        </Step>
      </ol>
    </section>
  );
}

function Step({
  n,
  title,
  visual,
  layout = "text-first",
  children,
}: {
  n: number;
  title: string;
  visual: ReactNode;
  /** Desktop order; alternating rows set the reading rhythm. Mobile is always text first. */
  layout?: "text-first" | "visual-first";
  children: ReactNode;
}) {
  const flip = layout === "visual-first";
  return (
    <li className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
      <div className={flip ? "min-w-0 md:order-2" : "min-w-0"}>
        <p className="label-caps text-sm text-brand-ink">Step {n} of 3</p>
        <h3 className="display mt-2 text-xl md:text-2xl">{title}</h3>
        <p className="mt-3 max-w-[48ch] text-lg">{children}</p>
      </div>
      <div className={flip ? "min-w-0 md:order-1" : "min-w-0"}>{visual}</div>
    </li>
  );
}
