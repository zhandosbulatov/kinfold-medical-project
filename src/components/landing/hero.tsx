import Link from "next/link";
import { RxLabel } from "@/components/rx/rx-label";
import { Sticker } from "@/components/rx/sticker";
import { PrimaryLink, SecondaryLink } from "@/components/ui/link-button";

/** Top bar on the amber bottle. */
export function SiteHeader() {
  return (
    <div className="bg-brand text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="label-caps text-2xl tracking-normal">
          Kinfold
        </Link>
        <Link
          href="/app"
          className="font-semibold underline decoration-2 underline-offset-4 hover:decoration-ink/40"
        >
          See the demo
        </Link>
      </header>
    </div>
  );
}

/** Signature move: Rose's prescription label on the amber bottle, stamped TAKEN. */
export function Hero() {
  return (
    // -mt-px closes the sub-pixel seam with the header band above.
    <div className="-mt-px bg-brand text-ink">
      <section
        aria-labelledby="hero-title"
        className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-6 pb-20 md:grid-cols-[1.1fr_1fr] md:gap-16 md:pt-12 md:pb-28"
      >
        <div>
          <h1 id="hero-title" className="display text-3xl md:text-4xl">
            Know Mom took her pills. Without calling every day.
          </h1>
          <p className="mt-5 max-w-[46ch] text-lg">
            Snap a photo of each pill bottle. Mom taps one large button when she takes them. You
            and your siblings see every dose, and a missed one is flagged within 30 minutes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PrimaryLink href="/quiz">Take the 2-minute check</PrimaryLink>
            <SecondaryLink href="/app">See the demo</SecondaryLink>
          </div>
          <p className="mt-5 text-ink/80">
            For families back home after a hospital stay, a fall or a new diagnosis.
          </p>
        </div>

        <figure className="relative mx-auto w-full max-w-md pb-10 md:max-w-none">
          <RxLabel on="bottle" className="rotate-[0.6deg]">
            <RxLabel.Header rx="4471203" pharmacy="Riverside Pharmacy" />
            <RxLabel.Patient>Rose M.</RxLabel.Patient>
            <RxLabel.Drug>Metformin 500 mg tablet</RxLabel.Drug>
            <RxLabel.Directions>Take 1 tablet by mouth twice daily with food.</RxLabel.Directions>
            <RxLabel.Meta
              items={[
                ["Qty", "60"],
                ["Refills", "2"],
                ["Filled", "10/28"],
              ]}
            />
            <Sticker tone="yellow" className="absolute -top-3 right-4 rotate-[3deg]">
              Take with food
            </Sticker>
          </RxLabel>

          <div className="absolute bottom-0 left-4 origin-bottom-left animate-[stamp_220ms_var(--ease-out)_350ms_both] sm:left-8">
            <Sticker tone="green" className="flex-col items-start gap-0 px-3.5 py-2 text-base shadow-label">
              <span className="text-lg">✓ Taken 8:12 AM</span>
              <span className="font-sans text-sm font-semibold normal-case tracking-normal">
                Anna &amp; Ben can see it
              </span>
            </Sticker>
          </div>
          <figcaption className="sr-only">
            Rose’s Metformin label, marked taken at 8:12 AM and visible to Anna and Ben.
          </figcaption>
        </figure>
      </section>
    </div>
  );
}
