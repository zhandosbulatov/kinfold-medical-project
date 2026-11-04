import { PageStub } from "@/components/page-stub";

export const metadata = { title: "Medications" };

export default function Page() {
  return (
    <PageStub title="Rose’s medications" prompt="Prompt 4 + 6">
      <p>Medication list with refill countdowns; “Add from a photo” (simulated label reading) and typed entry.</p>
    </PageStub>
  );
}
