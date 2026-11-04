import Link from "next/link";
import { Quiz, QuizBack, QuizProgress, QuizStep } from "@/components/quiz/quiz";

export const metadata = {
  title: "How much help does Mom need?",
  description: "A 2-minute check that turns your answers into a care plan for Mom.",
};

export default function QuizPage() {
  return (
    <Quiz>
      <div className="border-b border-line bg-surface">
        <header className="mx-auto flex max-w-xl items-center justify-between px-5 pt-4">
          <QuizBack />
          <Link href="/" className="label-caps text-lg tracking-normal">
            Kinfold
          </Link>
        </header>
        <div className="mx-auto max-w-xl px-5 pt-3 pb-4">
          <QuizProgress />
        </div>
      </div>
      <main className="mx-auto w-full max-w-xl flex-1 px-5">
        <QuizStep />
      </main>
    </Quiz>
  );
}
