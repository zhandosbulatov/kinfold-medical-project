import { ClosingCta, Faq, SiteFooter, WhatItIsNot } from "@/components/landing/closing";
import { Hero, SiteHeader } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { WhyNow } from "@/components/landing/why-now";

// Landing page. Fully static: no runtime data, no client JS.
export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-10 rounded-label bg-ink px-4 py-2 text-surface focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <HowItWorks />
        <WhyNow />
        <WhatItIsNot />
        <Faq />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
