import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiteHeader } from "@/components/landing/hero";
import { Sticker } from "@/components/rx/sticker";
import { PrimaryLink } from "@/components/ui/link-button";
import { db } from "@/db";
import { careRecipients, members } from "@/db/schema";
import { getMemberByInviteToken } from "@/lib/data/family";
import { joinCircle } from "./actions";

export const metadata = {
  title: "Join the care circle",
  robots: { index: false, follow: false },
};

// A sibling's invite link: no account, one button.
export default function JoinPage({ params }: PageProps<"/join/[token]">) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-5 pt-10 pb-16">
        <Suspense fallback={<p className="text-lg">Opening your invite…</p>}>
          <Invite params={params} />
        </Suspense>
      </main>
    </>
  );
}

async function Invite({ params }: Pick<PageProps<"/join/[token]">, "params">) {
  const { token } = await params;
  const invite = await getMemberByInviteToken(token);
  if (!invite) notFound();
  const { member, family } = invite;

  const [[organizer], [recipient]] = await Promise.all([
    db
      .select({ name: members.name })
      .from(members)
      .where(and(eq(members.familyId, family.id), eq(members.role, "organizer")))
      .limit(1),
    db
      .select({ name: careRecipients.name })
      .from(careRecipients)
      .where(eq(careRecipients.familyId, family.id))
      .limit(1),
  ]);
  const inviter = organizer?.name ?? "Your family";
  const parent = recipient?.name ?? "Mom";

  if (member.joinedAt) {
    return (
      <>
        <h1 className="display text-3xl">You’re already in {parent}’s circle</h1>
        <p className="mt-3 text-lg">Open the family view to see today’s doses and tasks.</p>
        <div className="mt-6">
          <PrimaryLink href="/app/family">Open the family view</PrimaryLink>
        </div>
      </>
    );
  }

  const join = joinCircle.bind(null, token);
  return (
    <>
      <Sticker tone="green">Invite for {member.name}</Sticker>
      <h1 className="display mt-3 text-3xl">
        {inviter} invited you to {parent}’s care circle
      </h1>
      <p className="mt-4 text-lg">Once you join, you’ll see:</p>
      <ul className="mt-2 list-disc space-y-1 pl-6 text-lg">
        <li>Every dose {parent} takes, and any she misses</li>
        <li>Refills that are running low</li>
        <li>A shared task list you can take things from</li>
      </ul>
      <p className="mt-4 text-ink-muted">No account or password needed.</p>
      <form action={join} className="mt-8">
        <button className="inline-flex min-h-12 items-center rounded-label bg-ink px-6 font-semibold text-surface transition-[background-color,transform] duration-150 hover:bg-ink/85 active:translate-y-px">
          Join {parent}’s circle
        </button>
      </form>
    </>
  );
}
