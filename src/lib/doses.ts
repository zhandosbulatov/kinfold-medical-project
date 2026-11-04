import { MISSED_AFTER_MINUTES } from "./demo";

export type DoseStatus = "due" | "taken" | "missed";

/**
 * Status as shown to the family. No cron: a dose still "due" more than
 * MISSED_AFTER_MINUTES after its time is treated as missed when read.
 */
export function effectiveStatus(
  dose: { status: DoseStatus; scheduledAt: Date },
  now = new Date(),
): DoseStatus {
  if (
    dose.status === "due" &&
    now.getTime() - dose.scheduledAt.getTime() > MISSED_AFTER_MINUTES * 60_000
  ) {
    return "missed";
  }
  return dose.status;
}
