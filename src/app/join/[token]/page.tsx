import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageStub } from "@/components/page-stub";
import { getMemberByInviteToken } from "@/lib/data/family";

export const metadata = {
  title: "Join the care circle",
  robots: { index: false, follow: false },
};

// Sibling invite link. Built out in Prompt 4.
export default function JoinPage({ params }: PageProps<"/join/[token]">) {
  return (
    <PageStub title="Join the care circle" prompt="Prompt 4">
      <Suspense fallback={<p>Loading invite…</p>}>
        <Invite params={params} />
      </Suspense>
    </PageStub>
  );
}

async function Invite({ params }: Pick<PageProps<"/join/[token]">, "params">) {
  const { token } = await params;
  const invite = await getMemberByInviteToken(token);
  if (!invite) notFound();
  return (
    <p>
      {invite.member.name}, you’ve been invited to <strong>{invite.family.name}</strong>.
    </p>
  );
}
