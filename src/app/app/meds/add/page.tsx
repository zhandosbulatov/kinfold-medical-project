import Link from "next/link";
import { Suspense } from "react";
import { AppPage, Skeleton } from "@/components/app/app-page";
import { getMedsView } from "@/lib/data/app";
import { getDemoFamily } from "@/lib/data/family";
import { AddMedication } from "./add-medication";

export const metadata = { title: "Add medication" };

export default function AddMedicationPage() {
  return (
    <AppPage title="Add medication">
      <Link href="/app/meds" className="mt-2 inline-flex min-h-11 items-center font-semibold underline underline-offset-4">
        <span aria-hidden>←</span>&nbsp;Back to medications
      </Link>
      <Suspense fallback={<Skeleton lines={2} />}>
        <AddFlow />
      </Suspense>
    </AppPage>
  );
}

async function AddFlow() {
  const demo = await getDemoFamily();
  if (!demo) return null;
  const meds = await getMedsView(demo.recipient.id);
  // Only names cross to the client: enough to pick the next unused sample.
  return <AddMedication existingNames={meds.map((m) => m.name)} />;
}
