import { PageStub } from "@/components/page-stub";

export const metadata = { title: "Add medication" };

// Built in Prompt 6: photo (simulated label reading) or typed entry.
export default function Page() {
  return (
    <PageStub title="Add medication" prompt="Prompt 6">
      <p>Snap the pill bottle or type the medication. Coming in the next build step.</p>
    </PageStub>
  );
}
