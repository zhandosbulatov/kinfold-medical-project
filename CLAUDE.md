@AGENTS.md

# Kinfold: capstone MVP (demo only)

Zimran IT School capstone, Team 4 (Jandos + Temirlan). **Due 6 Nov 2026, 12:00 Almaty.** Pitch 7 Nov.
- Full brief: `../kinfold-medical/2026-11-04-kinfold-project.md`
- Grading and deliverables: `../../CONTEXT.md` §2.5–2.8
- Build plan: `docs/build-prompts.md`

## Product in one line
A family care coordinator for **working adult children** managing an aging parent's medications. **Rose** (mom, ~80) has almost nothing to do. **Anna** (daughter, organizer) and **Ben** (brother) see every dose and get alerted when one is missed. Positioning: Kinfold wins by **doing work** (reading pill bottles, catching missed doses), not just by organizing.

## Personas
| Who | Role | Needs |
|---|---|---|
| Anna | Organizer | See that Mom took her meds without calling every day; share the load |
| Ben | Sibling | See activity, take tasks; joins via invite link |
| Rose | Care recipient | No login, no setup, no payment. One big button |

## Scope: demo-only MVP
**In:**
- Landing page
- Quiz leading to a personalized care-plan page, then `/app`
- Anna's app with three tabs: Today, Meds, Family
- Rose's private link
- Sibling invite page
- Adding meds from a photo. **Simulated:** the photo gets a "reading label…" step and preset results; there's no AI call
- In-app Demo controls

**Out (do not build):** payments, paywall or Stripe; accounts or logins; web push or PWA; SMS, calls or email; cron jobs; admin dashboard; cancel flow; Record tab; care-stage switch; doctor-visit summaries; benefits guide.

## Non-negotiable guardrails
- **No medical advice.** The app reminds and organizes. Anything about doses gets "Ask your pharmacist." Extracted meds are always shown for the user to check against the label.
- **Honest copy.** No unsourced stats. Sourced figures come from the brief (e.g. 63M US caregivers, AARP/NAC 2025). Simulated features are labelled as such in README/DEMO.md.
- **Rose's screen:** text ≥22px (`text-rose`), tap targets ≥64px, one thing at a time, no navigation, no time-outs.
- **Privacy tone:** this is not surveillance. Mom stays in control.

## Stack
- Next.js 16 (App Router, `src/`), React 19, TypeScript, Tailwind v4. **Cache Components is on** (`cacheComponents: true`): any component that reads the DB, `params`, `cookies` or `searchParams` must sit inside `<Suspense>`. **Every DB reader must start with `await connection()`** (from `next/server`), as in `src/lib/data/family.ts`. Without it, Next tries to prerender the read and crashes on `new Date()` after a `revalidatePath`. Read `node_modules/next/dist/docs/` before using an API you're unsure of (Next 16 renamed middleware to `proxy.ts`, etc.).
- Drizzle ORM. `DATABASE_URL` set → Neon via postgres-js (`prepare: false`). Unset → embedded **PGlite** in `./.pglite` (local dev, no Docker). PGlite is single-process: **stop `next dev` before `db:migrate` / `db:seed`.**
- Deploy: Vercel and Neon (Vercel Marketplace). Live at https://kinfold-medical-project.vercel.app. Each push to `main` deploys to production.
  - Vercel runs the `vercel-build` script: migrate, then seed, then `next build`. **Every deploy re-seeds the demo family**, so don't push during a live demo.
  - Scripts use `DATABASE_URL_UNPOOLED` (Neon's direct connection) when it's set. The app uses the pooled `DATABASE_URL`.

## Data model (`src/db/schema.ts`)
- **Family:** `families` (slug `demo`), `members` (role organizer|sibling, `invite_token`), `care_recipients` (`private_token`, timezone).
- **Medications:** `medications` (strength and dose as printed, `schedule_times` "HH:MM" local, pills_left, refill_date, source photo|manual). `dose_events` (scheduled_at, status due|taken|missed, confirmed_at), with unique (medication_id, scheduled_at).
- **Everything else:** `check_ins` (mood 1–3), `tasks`, `appointments`, `activity` (family feed).
- **Missed doses are computed on read:** a dose still `due` more than 30 min after its time counts as missed. See `effectiveStatus()` in `src/lib/doses.ts`. There is no cron.

## Shared demo family
There are no accounts: every visitor sees the same seeded family (`getDemoFamily()` in `src/lib/data/family.ts`).
- Seed: `src/db/seed-demo.ts`. Anna is joined; Ben and Clara are invited but not joined. Rose takes 3 meds (Lisinopril 10 mg AM, Metformin 500 mg 2×, Atorvastatin 20 mg PM). There are 7 days of history with 2 missed doses, 2 appointments and 3 tasks.
- Links: Anna `/app` · Rose `/r/demo-rose` · Ben `/join/demo-ben`
- Demo controls (`src/app/app/demo-actions.ts`): **Simulate missed dose** makes the next due dose overdue; **Reset demo** re-runs the seed. They're unauthenticated server actions on purpose, since everything is demo data.

## Routes
| Route | What | Prompt |
|---|---|---|
| `/` | Landing | 2 |
| `/quiz`, `/quiz/result` | Quiz → personalized plan → `/app` | 3 |
| `/app` | Today: doses taken/due/missed, missed alert, mood, appointments, refills, Demo controls | 4 |
| `/app/meds` | Medication list, add from photo (simulated) or typed | 4, 6 |
| `/app/family` | Siblings, invite link, tasks, activity feed | 4 |
| `/join/[token]` | Sibling joins the circle | 4 |
| `/r/[token]` | Rose: "I took them", mood faces, "Call Anna" | 5 |

## Commands
```
npm run dev          # local dev (PGlite unless DATABASE_URL is set)
npm run db:generate  # after editing schema.ts → new SQL in drizzle/
npm run db:migrate   # apply migrations
npm run db:seed      # (re)create the demo family
npm run db:reset     # migrate + seed
npm run typecheck && npm run lint && npm run build
```

## Conventions
From the `vercel-react-best-practices` and `vercel-composition-patterns` skills:
- **Components:**
  - Server Components by default. Add `"use client"` only for interactivity, kept as small leaf components.
  - Never define components inside components.
  - Use ternaries, not `&&`, for conditional JSX.
- **Data:**
  - Put independent awaits in `Promise.all`.
  - Wrap per-request repeated lookups in `React.cache`.
  - Pass only the fields a client component needs, not whole rows.
  - Stream with `<Suspense>`, which Cache Components requires anyway.
- **Imports:** direct, never through barrel files.
- **Component APIs:** compound components and explicit variants instead of boolean props (e.g. `<DoseCard.Taken>` / `<DoseCard.Missed>`, not `<DoseCard isMissed>`). Lift shared state into a provider; under React 19 use `use()`, not `forwardRef`/`useContext`.
- **Client compound components:** `Object.assign(Root, { Part })` dot-notation doesn't survive the server/client boundary. A Server Component can't read `Quiz.Step` off a client reference, so export the parts by name (`QuizStep`), as in `src/components/quiz/quiz.tsx`. Server-only compounds such as `RxLabel` can keep dot-notation.
- **View transitions:** use React `<ViewTransition>` with the classes in `globals.css` (`slide-from-right`/`-left`, `slide-to-left`/`-right`, `slide-up`/`slide-down`). Steps use `startTransition` + `addTransitionType("quiz-forward" | "quiz-back")`, and navigations use `router.push(url, { transitionTypes: ["nav-forward"] })`. When testing in the hidden Browser pane, no frames are drawn, so transitions hang. Set `Document.prototype.startViewTransition = undefined` first.
- **Mutations:** Server Actions + `revalidatePath`. Plain `<form action>` where possible.
- **Styling:**
  - **Read `DESIGN.md` first.** It's the source of truth for the "pharmacy label" direction. Reuse `RxLabel`, `Sticker` (`src/components/rx/`) and `PrimaryLink`/`SecondaryLink` (`src/components/ui/`). Amber (`bg-brand`) always takes ink text, never white. The `display` and `label-caps` utilities set the Archivo headline and label styles.
  - Use design tokens from `src/app/globals.css` (`bg-canvas`, `text-ink`, `text-ink-muted`, `bg-brand`, `*-taken|due|missed`, `text-rose`). Never raw hex.
  - Status *text* uses the `*-ink` variants for contrast.
  - Respect `prefers-reduced-motion` (handled globally).
- **Placeholders:** pages still marked with `<PageStub>` are placeholders. Replace them, don't extend them.
- **Commits:** small, one per prompt, imperative messages.
