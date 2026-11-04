# Kinfold: Build Prompts (vercel-labs/agent-skills)

*Team 4, Zimran IT School capstone. Deadline: 6 Nov 2026, 12:00 Almaty (LMS).*
*Source briefs: `../kinfold-medical/2026-11-04-kinfold-project.md`, `../../CONTEXT.md` (§2.5–2.8). Project rules: `CLAUDE.md`.*

## Scope: demo-only MVP

Everyone shares one seeded family (Anna, Ben and Rose), so there are no accounts and no payments.

**What we build:**
- Landing page
- Quiz leading to a personalized care-plan page, then the app
- Anna's app: Today, Meds and Family tabs
- Rose's private link
- Sibling invite page
- Adding meds from a photo (**simulated** reading)
- Demo controls

**Dropped:** paywall/Stripe, logins, web push/PWA, SMS/email, cron, admin dashboard, cancel flow, Record tab, care-stage switch, real AI calls.

**Accounts you need:** GitHub (public repo) and Vercel. Neon is added from inside Vercel. No API keys.

## How the skills fit in

| Skill | Where it's used |
|---|---|
| `vercel-react-best-practices` | Every prompt that writes code (server components, Suspense, parallel fetches, bundle size) |
| `vercel-composition-patterns` | Quiz steps, dose cards, med review cards. Compound components instead of boolean props |
| `vercel-react-view-transitions` | Moving between quiz steps, the care-plan reveal, the "I took them" confirmation, switching tabs |
| `web-design-guidelines` | Accessibility audit. Strictest on Rose's screen (she's 80) |
| `writing-guidelines` | Copy for the landing page, quiz and care plan. Honest claims, no medical advice |
| `deploy-to-vercel` / `vercel-cli-with-tokens` | Deploy early (prompt 1), ship at the end (prompt 8) |
| `vercel-optimize`, `vercel-react-native-skills` | Not used: no traffic metrics to optimize, and the MVP is web only |

Optional, outside vercel-labs: `frontend-design-deslop` for the visual direction in prompt 2.

## Order and splitting the work

- **0 → 1 first, in order.** After that, the funnel (2 → 3) and the app (4 → 5 → 6) don't depend on each other. Jandos and Temirlan can take one each on separate branches.
- Then **7 (audit)** and **8 (ship)** run on the merged result.
- **If time runs short:** cut 6 down to typed entry only, then simplify 3 to five questions. Never cut 5 (Rose) or 8 (ship).

---

## Prompt 0: Scaffold and project memory (DONE)

Already in the repo:
- Next.js 16 + Tailwind v4 + Drizzle
- Neon in production, embedded PGlite locally
- Schema, migration, and the demo seed (`npm run db:seed`)
- Design tokens in `globals.css`
- Route stubs
- Demo controls (Simulate missed dose, Reset demo)
- `CLAUDE.md`

Read `CLAUDE.md` before every prompt below. It holds the scope, the guardrails and the conventions.

## Prompt 1: Deploy early

```text
Use the deploy-to-vercel skill (fall back to vercel-cli-with-tokens if interactive login fails). Read CLAUDE.md first.

Create a public GitHub repo "kinfold" (the jury needs to open it), push the current branch as main, create/link a Vercel project, add Neon Postgres through the Vercel Marketplace so DATABASE_URL is set for all environments, then run `npm run db:migrate` and `npm run db:seed` against Neon (pull the env with `vercel env pull .env.local`). Enable Vercel Analytics. Connect Git so every push to main redeploys. Deploy to production and confirm /, /app, /r/demo-rose and /join/demo-ben load and the Today stub shows real dose counts. Report the production URL.
```

## Prompt 2: Landing page

```text
Use vercel-react-best-practices, writing-guidelines and web-design-guidelines (optionally frontend-design-deslop for visual direction). Read CLAUDE.md first.

Replace the stub at / with the real landing page. It's a "24/7 salesperson" and the jury grades it on CTA, copy and design. Aim it at the crisis moment, not at "caregivers" (people don't call themselves that): just home from the hospital, a fall, a new diagnosis. Sections:
1. Hero: one-line promise (e.g. "Know Mom took her pills — without calling every day"), sub-line, one primary CTA → /quiz ("Take the 2-minute check") and a secondary "See the demo" → /app.
2. How it works in 3 steps: snap the pill bottles → Mom taps "I took them" → you and your siblings see every dose and hear about a missed one.
3. "Mom doesn't set up anything": a mock of Rose's screen (big button, no login, no app to learn).
4. Why now: brief stats with sources (63M US family caregivers — AARP/NAC 2025; 6 in 10 also work).
5. What it is not: not medical advice, not surveillance (Mom stays in control).
6. Short FAQ (what if Mom has no smartphone, privacy, who sees what).
7. Repeat CTA. Footer: "Kinfold is a capstone demo. Not medical advice."
Mobile-first (traffic would come from Meta ads), fully static, no client JS unless needed. Use the design tokens only. Then run the writing-guidelines and web-design-guidelines reviews on the page and fix what they find. typecheck + lint + build, commit, push.
```

## Prompt 3: Quiz → personalized care plan

```text
Use vercel-composition-patterns, vercel-react-view-transitions and vercel-react-best-practices. Read CLAUDE.md first.

Build the quiz at /quiz using the Zimran funnel anatomy, minus the paywall: Questions → Teasers → Magic page → "See it in action". 8 steps, one question per screen, progress bar, back button, answers kept in sessionStorage so a refresh doesn't lose them. The first question picks up the ad's promise.
Questions (adjust wording): what's happening now (just home from hospital / recent fall / new diagnosis / gradually needs more help); parent's first name (default "Mom"); her age range; how many daily meds; does she live alone; who else helps (siblings: none / 1 / 2+); biggest worry (missed doses / running out of pills / not knowing what's going on); does she use a smartphone (yes / basic phone / landline).
Add 2 teaser screens between questions, with soft, honest claims and no invented stats.
Build it as a compound component (<Quiz>, <Quiz.Step>, <Quiz.Options>, <Quiz.Teaser>, <Quiz.Progress>) with state in a provider. No boolean prop pile-up. Animate between steps with ViewTransition (directional for forward/back); reduced motion is already handled globally.
/quiz/result = magic page: "[Name]'s care plan", built from the answers: daily reminder plan sized to her med count, a note when she lives alone with 3+ meds, siblings to invite, and how she'd confirm doses based on her phone answer (smartphone → one-tap link; basic phone/landline → "text and call reminders are on our roadmap"). Reveal it with a ViewTransition. CTA: "See it in action" → /app (the shared demo family). No email capture, no paywall, no prices.
Run writing-guidelines over all quiz copy. typecheck + lint + build, commit, push.
```

## Prompt 4: Anna's app (Today, Meds, Family) and the sibling invite

```text
Use vercel-composition-patterns, vercel-react-best-practices and vercel-react-view-transitions. Read CLAUDE.md first.

Replace the stubs under /app with Anna's real app, reading the shared demo family (getDemoFamily). Mobile-first, keep the existing bottom tab bar (Today / Meds / Family) and keep <DemoControls /> at the bottom of Today.
- Today: today's doses grouped by time (morning / evening) as status cards: taken (with time confirmed), due, missed. Use effectiveStatus() from src/lib/doses.ts; never store "missed" from the UI. A missed dose is visually loud at the top as an alert card with a "Call Mom" (tel:) button. Also: Rose's latest mood check-in, the next appointment, refill warnings (≤7 days of pills left: pills_left ÷ doses per day), and a small "Rose's link" card to copy /r/<token>.
- Meds: list of active meds with strength, schedule, pills left / refill countdown, and source badge (from photo / typed). Leave an "Add medication" button that links to /app/meds/add (built in prompt 6).
- Family: members in the circle (joined vs invited) with a "care circle" progress bar, a copyable invite link per invited sibling, a shared task list (add task, claim, mark done → writes an activity entry), and the activity feed (newest first).
- /join/[token]: Ben sees "Anna invited you to Rose's care circle", what he'll see, and a "Join" button (server action: set joined_at, add an activity entry "Ben joined the circle") → redirect to /app/family.
Composition: a DoseCard compound component with explicit variants (DoseCard.Taken / .Due / .Missed), no status booleans. Server Components for data; small client leaves only for copy-to-clipboard and optimistic task toggles. Fetch independent data with Promise.all inside Suspense boundaries (Cache Components is on). Tab and status changes animate with ViewTransition. Today should stay fresh for the live demo: add a tiny client "refresh on focus + every 15s" leaf that calls router.refresh().
typecheck + lint + build, commit, push.
```

## Prompt 5: Rose's private link

```text
Use web-design-guidelines (strictly) and vercel-react-best-practices, plus vercel-react-view-transitions for the confirmation moment. Read CLAUDE.md first.

Replace the stub at /r/[token] with Rose's screen: no login, no setup, built for an 80-year-old.
- One thing at a time: the next dose that's due or overdue today, grouped by time ("Your morning pills: Lisinopril 10 mg, Metformin 500 mg") with a huge full-width "I took them" button (≥64px tall). The server action marks those dose_events taken with confirmed_at and adds an activity entry. Then a calm confirmation ("Thank you, Rose. Anna can see it.") animated with ViewTransition, then the next time slot or "All done for today 🌷".
- "How are you feeling?": three big faces (not well / okay / good) → check_ins row + activity entry.
- A big "Call Anna" button (tel: link to the organizer's phone).
- No navigation, no jargon, text-rose (≥22px) everywhere, high contrast, works with large system font sizes, one-handed, no time-outs. Use useFormStatus/useOptimistic so the tap feels instant.
- A confirmation must show on Anna's Today (/app) within ~15 seconds (prompt 4's refresh).
Then run a full web-design-guidelines audit on /r/[token] and fix every issue (focus states, contrast, tap targets, labels, reduced motion, lang, landmarks). typecheck + lint + build, commit, push.
```

## Prompt 6: Add meds from a photo (simulated) or by typing

```text
Use vercel-composition-patterns and vercel-react-best-practices. Read CLAUDE.md first.

Build /app/meds/add, the "doing the work" moment of the demo. Photo reading is SIMULATED; there's no AI call or API key.
1. "Snap the pill bottle": a camera/file input (accept="image/*" capture="environment") plus 2–3 sample bottle images in /public/demo the presenter can tap instead. Show the chosen photo.
2. "Reading the label…": a 1.5–2 s staged animation (finding the label → reading the drug name → reading the dose and directions). Then return a preset result. Map each sample image to its own med (e.g. Amlodipine 5 mg once daily, Levothyroxine 50 mcg every morning, Donepezil 10 mg at bedtime); any uploaded photo gets the next unused preset. Fields: name, strength, dose, times per day → schedule times, quantity, refill date, plus one field flagged "check this" (low confidence).
3. Review card: every field is editable, the flagged field is highlighted, with the line "Check this against the label. Kinfold doesn't give medical advice — ask your pharmacist." Save requires an explicit confirm.
4. Typed entry fallback on the same page: name, strength, times per day, pills on hand.
Saving inserts the medication (source photo|manual), generates dose_events for today (remaining times only) and tomorrow, adds an activity entry ("Anna added Amlodipine from a bottle photo"), and redirects to /app/meds. Reset demo must remove added meds (it already re-seeds).
Build the review as a compound component (<MedReview>, <MedReview.Field>, <MedReview.Flag>, <MedReview.Actions>), with no boolean props. Keep the simulated reader in one module (src/lib/simulated-label-reader.ts) so it could be swapped for a real vision call later. typecheck + lint + build, commit, push.
```

## Prompt 7: Audit everything

```text
Use web-design-guidelines, writing-guidelines, vercel-react-best-practices and vercel-composition-patterns as reviewers, not builders. Read CLAUDE.md first.

Audit the whole app: /, /quiz, /quiz/result, /app, /app/meds, /app/meds/add, /app/family, /join/[token], /r/[token]. Produce a prioritized findings list (file:line), then fix all high and medium issues:
- accessibility, and mobile layout at 375px
- copy: clarity, sourced claims only, no medical advice, consistent names (Rose/Anna/Ben)
- React and Next performance: waterfalls, unnecessary client components, data passed to client components, Suspense placement under Cache Components
- component APIs: no boolean-prop variants, no components defined inside components
- removal of any leftover <PageStub> usage
Re-run typecheck + lint + build. Commit as "Audit fixes".
```

## Prompt 8: Ship and prepare the demo

```text
Use the deploy-to-vercel skill. Read CLAUDE.md first.

Push main and confirm the production deploy succeeded. Run migrations on Neon if the schema changed, and press Reset demo (or run db:seed) so the data is fresh for today's date. Smoke-test the live URL end to end: landing → quiz → care plan → /app; open /r/demo-rose in a second tab/phone → tap "I took them" → see it on Today; Simulate missed dose → alert shows; /app/meds/add with a sample photo → new med appears; /join/demo-ben → Ben joins. Fix anything broken and redeploy.
Then write:
- README.md: what Kinfold is, live URL, demo links (/app, /r/demo-rose, /join/demo-ben), stack, how to run locally (PGlite, no Docker), and a clear "Simulated in this demo" list (photo label reading, shared demo family, no payments or notifications).
- DEMO.md: a ≤2-minute screen-recording script for the Loom video, a 1-minute live-demo path for the pitch (two devices: Anna's phone and Rose's phone), when to press Simulate missed dose and Reset demo, and a fallback plan if the internet drops.
Commit and push.
```
