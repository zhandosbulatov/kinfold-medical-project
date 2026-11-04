import Link from "next/link";
import { Sticker } from "@/components/rx/sticker";
import { PrimaryLink } from "@/components/ui/link-button";

const NOTS = [
  {
    tone: "pink",
    label: "Not medical advice",
    text: "Kinfold reminds and organizes. Questions about a dose go to Mom’s pharmacist or doctor.",
  },
  {
    tone: "blue",
    label: "Not surveillance",
    text: "Nothing tracks Mom. She taps when she takes her pills, and that tap is what the family sees.",
  },
  {
    tone: "green",
    label: "Not another group chat",
    text: "One shared list of pills, tasks and appointments, instead of a thread that scrolls away.",
  },
] as const;

const FAQ = [
  {
    q: "What if Mom doesn’t have a smartphone?",
    a: "Today Kinfold works through a private link on any smartphone or tablet. Text-message and phone-call reminders for basic phones and landlines are on our roadmap.",
  },
  {
    q: "Who can see Mom’s information?",
    a: "Only the people you invite to her care circle. Mom sees her own pills and nothing else.",
  },
  {
    q: "Does Kinfold tell Mom what to take?",
    a: "No. Kinfold follows the schedule printed on her labels and reminds her. It never changes a dose or gives medical advice.",
  },
  {
    q: "How do my brothers and sisters join?",
    a: "Send each of them their invite link. They see the same doses, tasks and activity you do, and they can take tasks off your list.",
  },
  {
    q: "What does it cost?",
    a: "One plan covers the whole family, and Mom never pays. This demo is free to explore.",
  },
] as const;

export function WhatItIsNot() {
  return (
    <section aria-labelledby="not-title" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
      <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
        <h2 id="not-title" className="display text-2xl md:text-3xl">
          What Kinfold won’t do
        </h2>
        <ul className="space-y-8">
          {NOTS.map((n) => (
            <li key={n.label}>
              <Sticker tone={n.tone}>{n.label}</Sticker>
              <p className="mt-2 max-w-[52ch] text-lg">{n.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section aria-labelledby="faq-title" className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[1fr_1.4fr] md:gap-16 md:py-28">
        <h2 id="faq-title" className="display text-2xl md:text-3xl">
          Questions families ask
        </h2>
        <div className="divide-y divide-line border-y border-line">
          {FAQ.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-semibold hover:text-brand-ink [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden
                  className="label-caps text-2xl transition-transform duration-150 ease-out group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-[60ch] pb-5 text-lg text-ink-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ClosingCta() {
  return (
    <section aria-labelledby="close-title" className="bg-brand">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
        <h2 id="close-title" className="display max-w-[22ch] text-2xl md:text-3xl">
          Start with the <span className="whitespace-nowrap">2-minute</span> check
        </h2>
        <p className="mt-3 max-w-[48ch] text-lg">
          Answer 8 questions about Mom and get a care plan you can try right away.
        </p>
        <div className="mt-8">
          <PrimaryLink href="/quiz">Take the 2-minute check</PrimaryLink>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ink text-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[60ch] text-surface/80">
          Kinfold is a capstone demo by Team 4, Zimran IT School. It doesn’t give medical advice.
        </p>
        <nav aria-label="Footer" className="flex gap-6">
          <Link href="/quiz" className="underline underline-offset-4 hover:text-brand focus-visible:outline-surface">
            Take the check
          </Link>
          <Link href="/app" className="underline underline-offset-4 hover:text-brand focus-visible:outline-surface">
            See the demo
          </Link>
        </nav>
      </div>
    </footer>
  );
}
