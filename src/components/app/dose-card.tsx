import type { ReactNode } from "react";
import type { TodayDose } from "@/lib/data/app";
import { fmtTime } from "@/lib/format";

type DoseProps = { dose: TodayDose; timeZone: string };

/** Shared row layout. Not exported: callers pick an explicit variant. */
function Row({
  dose,
  timeZone,
  surface,
  children,
}: DoseProps & { surface: string; children: ReactNode }) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-label px-3 py-3 ${surface}`}>
      <div className="min-w-0">
        <p className="font-mono text-sm tabular-nums text-ink-muted">
          {fmtTime(dose.scheduledAt, timeZone)}
        </p>
        <p className="truncate text-lg font-semibold">
          {dose.name}
          {dose.strength ? <span className="font-normal text-ink-muted"> {dose.strength}</span> : null}
        </p>
      </div>
      <p className="shrink-0 text-right font-semibold">{children}</p>
    </div>
  );
}

function Taken({ dose, timeZone }: DoseProps) {
  return (
    <Row dose={dose} timeZone={timeZone} surface="bg-surface">
      <span className="text-taken-ink">
        ✓ Taken
        {dose.confirmedAt ? (
          <span className="block text-sm font-normal">{fmtTime(dose.confirmedAt, timeZone)}</span>
        ) : null}
      </span>
    </Row>
  );
}

function Due({ dose, timeZone }: DoseProps) {
  return (
    <Row dose={dose} timeZone={timeZone} surface="bg-due-soft">
      <span className="text-due-ink">○ Due</span>
    </Row>
  );
}

function Missed({ dose, timeZone }: DoseProps) {
  return (
    <Row dose={dose} timeZone={timeZone} surface="bg-missed-soft">
      <span className="text-missed-ink">× Missed</span>
    </Row>
  );
}

/** One dose, three explicit variants: <DoseCard.Taken>, <DoseCard.Due>, <DoseCard.Missed>. */
export const DoseCard = { Taken, Due, Missed };

/** Picks the variant from the dose's (effective) status. */
export function DoseCardFor(props: DoseProps) {
  switch (props.dose.status) {
    case "taken":
      return <Taken {...props} />;
    case "missed":
      return <Missed {...props} />;
    default:
      return <Due {...props} />;
  }
}
