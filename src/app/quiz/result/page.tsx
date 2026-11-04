import { PageStub } from "@/components/page-stub";

export const metadata = { title: "Rose’s care plan" };

export default function Page() {
  return (
    <PageStub title="Rose’s care plan" prompt="Prompt 3">
      <p>Personalized plan built from the quiz answers, then “See it in action” → /app.</p>
    </PageStub>
  );
}
