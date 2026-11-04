import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getRecipientByToken } from "@/lib/data/family";

export const metadata = {
  title: "Your pills today",
  robots: { index: false, follow: false },
};

// Rose's private link — no login, no setup. Built out in Prompt 5.
export default function RosePage({ params }: PageProps<"/r/[token]">) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-10 text-rose">
      <Suspense fallback={<p>One moment…</p>}>
        <RoseGreeting params={params} />
      </Suspense>
    </main>
  );
}

async function RoseGreeting({ params }: Pick<PageProps<"/r/[token]">, "params">) {
  const { token } = await params;
  const recipient = await getRecipientByToken(token);
  if (!recipient) notFound();
  return (
    <>
      <h1 className="font-display text-rose-xl font-semibold">Good day, {recipient.name}.</h1>
      <p className="mt-4 text-ink-muted">
        Your pills and the big “I took them” button will appear here (Prompt 5).
      </p>
    </>
  );
}
