# Kinfold: design system

The source of truth for the look. If `src/app/globals.css` or a component drifts from this file, this file wins.

## Discovery
- **Artifact:** a marketing landing page (campaign-style, one primary action) plus a mobile-first family app. Rose's screen is an ultra-simple single-task interface.
- **Audience:** working adults aged 35–60 in the US who manage an aging parent's medications, usually right after a hospital discharge, a fall or a diagnosis. Rose, the parent, is about 80.
- **Primary action:** take the 2-minute check (`/quiz`). The secondary action is "See the demo" (`/app`).
- **Positioning:** trustworthy consumer health, but not clinical. It's plainspoken and practical, never a cute startup toy.
- **Adjectives:** trustworthy, capable, plainspoken, warm, calm.
- **Essence:** labelled, checked, shared.

## Aesthetic commitment: the pharmacy label
- **The borrowed system:** a US prescription bottle. That means an amber bottle, a white printed label with ruled lines, condensed all-caps label-printer type, monospaced Rx numbers and quantities, and the colored **auxiliary warning stickers** the pharmacist adds ("TAKE WITH FOOD").
- **Why it fits:** every adult child in a caregiving crisis has stood at a kitchen counter squinting at these labels. Kinfold's core job is reading them.
- **What it rejects:** the category default for health apps, meaning soft pastel cards, a stock photo of a smiling grandmother, or teal-gradient "wellness" visuals. Also the 2026 tells: a cream background with an italic serif hero, and hero + 3 cards + testimonials.
- **Signature move:** the hero is Rose's actual prescription label sitting on an amber bottle surface, with a green auxiliary sticker stamped across its edge: "✓ TAKEN 8:12 AM · Anna & Ben can see it". Throughout the page, auxiliary stickers act as the callout device (MOM SETS UP NOTHING, NOT MEDICAL ADVICE).

## Typography
| Role | Face | Notes |
|---|---|---|
| Display / label caps | **Archivo** (variable, `wdth` 62–125) | Headlines at `wdth` ~80 (condensed) and weight 700–800. Label caps are uppercase, with letter spacing +0.04em |
| Body | **Atkinson Hyperlegible Next** | Designed for low-vision readers by the Braille Institute. It's the core of Rose's screen too |
| Data | **Atkinson Hyperlegible Mono** | Rx numbers, quantities, times, and receipt lines with dot leaders. Use `tabular-nums` |

**Scale:** 1.25 (major third), base 17px. The steps are 17, 21, 26.5, 33, 41.5 and 52 px. On mobile, the hero headline is 33–41px and never a full paragraph blown up.
**Rose's screen:** text is at least 22px (`text-rose`), and headlines are 32px (`text-rose-xl`).

## Color (OKLCH, about 60-30-10)
| Token | Value | Role |
|---|---|---|
| `canvas` | `oklch(0.975 0.004 95)` | Page background: a neutral pharmacy-counter white, not cream |
| `surface` | `oklch(0.995 0.002 95)` | Label paper and cards |
| `ink` | `oklch(0.2 0.012 60)` | Text and the primary button fill |
| `ink-muted` | `oklch(0.43 0.012 60)` | Secondary text (about 7:1 on canvas) |
| `line` | `oklch(0.86 0.006 80)` | Label rules and borders |
| `brand` (amber bottle) | `oklch(0.72 0.15 58)` | The dominant brand surface (hero, bands). Ink text on it is about 7:1. **Never white text on it** |
| `brand-strong` | `oklch(0.58 0.15 50)` | The bottle edge, borders and hover |
| `brand-ink` | `oklch(0.47 0.13 48)` | Amber-family text and links on white (≥4.5:1) |
| `brand-soft` | `oklch(0.95 0.04 70)` | Quiet amber wash |
| `sticker-green` / `-yellow` / `-blue` / `-pink` | L ~0.82–0.9 | Auxiliary stickers only, always with ink text. Use them small and sparingly |
| `taken` / `due` / `missed` (+ `-ink`, `-soft`) | green / yellow / red | Dose status. Status is never shown by color alone: always add a word and a glyph |
| `focus` | = `ink` | 3px focus ring, ≥3:1 on canvas, surface and amber. On ink backgrounds use `outline-surface` |

## Shape, depth, spacing
- **Radius:** two values only. `radius-label` is 6px (labels, buttons, stickers, inputs) and `radius-card` is 12px (app panels, Rose's big button). No pill buttons, since label corners are die-cut and small.
- **Depth:** a defined edge (a 1px `line` border) is the default. The single exception is a label lying on the amber bottle, which gets a soft paper shadow (`shadow-label`) **instead of** a border, never both.
- **Spacing:** 4px base. Tight inside a label (8–12px), generous between sections (72–112px on desktop, 56–72px on mobile).

## Craft decisions
- **Layout:** a single-column narrative, with alternating text and product-visual rows for "How it works". The product visuals are real UI built in HTML (label → extracted fields, Rose's screen, Anna's Today), never stock imagery. "Why now" is a printed pharmacy receipt (mono type, dot leaders, sources as line items) instead of a hero-metric triptych.
- **Components:**
  - **Buttons:** primary = ink fill with surface text; secondary = surface with an ink border; tertiary = a text link.
  - **States:** hover darkens or raises contrast, active nudges by 1px, focus-visible gets the 3px focus ring, and disabled lowers contrast. Font weight never changes between states.
  - **FAQ:** native `<details>`.
- **Motion:** one moment only. The TAKEN sticker "stamps" in (opacity plus scale from 1.12 to 1, 220ms, ease-out, 350ms delay). Animate only transform and opacity; reduced motion is honored globally.
- **Iconography:** typographic glyphs only (✓, →, ×) in the label face. No icon library and no emoji.
- **Dark mode:** out of scope for the MVP. `color-scheme: light`.
- **Accessibility:** WCAG 2.2 AA. Visible focus, targets ≥44px, a skip link, landmark elements, sourced claims with links, and color-independent status.

## Slop audit
**Landing v1 (Prompt 2): 9/10.**
- **Color:** passes. No indigo/violet, no gradient text, a neutral (not cream) canvas, and amber dominant with ink and small stickers.
- **Type:** passes. Archivo and Atkinson, not a reflex face. No eyebrow pill; the "Step N of 3" labels are used only because the steps really are sequential.
- **Structure:** passes the wireframe-strip check. The page runs bottle hero, then alternating text and product-visual rows, then a receipt, then a sticker list, then the FAQ, so it isn't hero + 3 cards + testimonials.
- **Detail:** passes. Radii are 6px and 12px. No element has both a border and a shadow. No glassmorphism, no stock imagery, no icon set.
- **Motion:** one transform-only stamp, visible at rest.
- **Accessibility:**
  - Skip link, landmarks, h1 → h2 → h3, and native `<details>`.
  - The product mock-ups are single `role="img"` elements with text alternatives.
  - The focus ring was changed to ink after it measured under 3:1 on amber.
- **Open item:** Atkinson draws slashed zeros ("3Ø"). That's deliberate for low-vision legibility but unusual in marketing copy. It was kept for consistency with Rose's screen.

## Changelog
- **2026-11-04:** Direction picked by the team from three candidates: pharmacy label, pill organizer and Sunday letter. This replaces the initial sage/Fraunces scaffold tokens: Fraunces is dropped (serif-editorial tell), sage is replaced by amber-bottle brand, and cream is replaced by a neutral canvas.
