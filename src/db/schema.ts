import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const id = () => uuid("id").primaryKey().defaultRandom();
const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

// ── Enums ──────────────────────────────────────────────────────────────
export const memberRole = pgEnum("member_role", ["organizer", "sibling"]);
export const medSource = pgEnum("med_source", ["photo", "manual"]);
/**
 * Stored status. "due" past its time + 30 min is shown as missed on read
 * (see src/lib/doses.ts) — there is no cron job.
 */
export const doseStatus = pgEnum("dose_status", ["due", "taken", "missed"]);
export const taskStatus = pgEnum("task_status", ["open", "done"]);

// ── Family & people ────────────────────────────────────────────────────
/** One household. The MVP uses a single shared demo family (slug "demo"). */
export const families = pgTable("families", {
  id: id(),
  name: text("name").notNull(),
  /** Stable handle, e.g. "demo" for the seeded jury family. */
  slug: text("slug").unique(),
  createdAt: createdAt(),
});

/** Adult children in the care circle (Anna = organizer, Ben = sibling). */
export const members = pgTable(
  "members",
  {
    id: id(),
    familyId: uuid("family_id")
      .notNull()
      .references(() => families.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    role: memberRole("role").notNull().default("sibling"),
    /** Used by /join/[token]. */
    inviteToken: text("invite_token").notNull().unique(),
    joinedAt: timestamp("joined_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("members_family_idx").on(t.familyId)],
);

/** The parent (Rose). Never logs in; reached via /r/[privateToken]. */
export const careRecipients = pgTable(
  "care_recipients",
  {
    id: id(),
    familyId: uuid("family_id")
      .notNull()
      .references(() => families.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone"),
    privateToken: text("private_token").notNull().unique(),
    timezone: text("timezone").notNull().default("America/New_York"),
    createdAt: createdAt(),
  },
  (t) => [index("care_recipients_family_idx").on(t.familyId)],
);

// ── Medications & doses ────────────────────────────────────────────────
export const medications = pgTable(
  "medications",
  {
    id: id(),
    careRecipientId: uuid("care_recipient_id")
      .notNull()
      .references(() => careRecipients.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    /** As printed on the label, e.g. "10 mg". */
    strength: text("strength"),
    /** As printed on the label, e.g. "1 tablet". */
    dose: text("dose"),
    /** Local times "HH:MM" in the recipient's timezone. */
    scheduleTimes: text("schedule_times").array().notNull(),
    instructions: text("instructions"),
    pillsPerDose: integer("pills_per_dose").notNull().default(1),
    pillsLeft: integer("pills_left"),
    refillDate: date("refill_date"),
    source: medSource("source").notNull().default("manual"),
    active: boolean("active").notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [index("medications_recipient_idx").on(t.careRecipientId)],
);

export const doseEvents = pgTable(
  "dose_events",
  {
    id: id(),
    medicationId: uuid("medication_id")
      .notNull()
      .references(() => medications.id, { onDelete: "cascade" }),
    /** Denormalized so "today's doses for Rose" is one indexed query. */
    careRecipientId: uuid("care_recipient_id")
      .notNull()
      .references(() => careRecipients.id, { onDelete: "cascade" }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    status: doseStatus("status").notNull().default("due"),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("dose_events_med_time_uq").on(t.medicationId, t.scheduledAt),
    index("dose_events_recipient_time_idx").on(t.careRecipientId, t.scheduledAt),
  ],
);

export const checkIns = pgTable(
  "check_ins",
  {
    id: id(),
    careRecipientId: uuid("care_recipient_id")
      .notNull()
      .references(() => careRecipients.id, { onDelete: "cascade" }),
    /** 1 = not well, 2 = okay, 3 = good. */
    mood: smallint("mood").notNull(),
    note: text("note"),
    createdAt: createdAt(),
  },
  (t) => [index("check_ins_recipient_idx").on(t.careRecipientId, t.createdAt)],
);

// ── Circle: tasks, appointments, activity ──────────────────────────────
export const tasks = pgTable(
  "tasks",
  {
    id: id(),
    familyId: uuid("family_id")
      .notNull()
      .references(() => families.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    assigneeMemberId: uuid("assignee_member_id").references(() => members.id, {
      onDelete: "set null",
    }),
    createdByMemberId: uuid("created_by_member_id").references(() => members.id, {
      onDelete: "set null",
    }),
    dueDate: date("due_date"),
    status: taskStatus("status").notNull().default("open"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("tasks_family_idx").on(t.familyId)],
);

export const appointments = pgTable(
  "appointments",
  {
    id: id(),
    careRecipientId: uuid("care_recipient_id")
      .notNull()
      .references(() => careRecipients.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    provider: text("provider"),
    location: text("location"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    notes: text("notes"),
    createdAt: createdAt(),
  },
  (t) => [index("appointments_recipient_idx").on(t.careRecipientId, t.startsAt)],
);

/** Feed shown in the Family tab ("Ben marked 'pick up refill' done"). */
export const activity = pgTable(
  "activity",
  {
    id: id(),
    familyId: uuid("family_id")
      .notNull()
      .references(() => families.id, { onDelete: "cascade" }),
    actorMemberId: uuid("actor_member_id").references(() => members.id, {
      onDelete: "set null",
    }),
    /** e.g. dose_taken, dose_missed, task_done, med_added, check_in, member_joined */
    kind: text("kind").notNull(),
    message: text("message").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("activity_family_idx").on(t.familyId, t.createdAt)],
);
