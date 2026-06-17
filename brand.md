# ENVIS — Brand Guide

> Turning overwhelming documents into calm, clear, doable steps.

ENVIS takes the documents that make hearts race — legal notices, medical bills, eviction warnings, debt collection letters — and translates them into plain language, an honest checklist of what to do next, and a draft of how to respond. The brand exists to lower a person's anxiety in the first five seconds and keep it low until they feel back in control.

---

## 1. Brand Essence

**Mission**
Help people facing stressful, confusing paperwork understand it and act on it — without panic, without a lawyer's bill, without shame.

**Vision**
A world where a scary envelope is just a task, not a crisis.

**Personality**
- **Calm, not clinical** — a steady friend, not a help-desk bot.
- **Clear, not condescending** — we simplify the document, never the person.
- **Supportive, not saccharine** — warmth that respects the seriousness of the moment.
- **Capable, not flashy** — quiet competence builds trust.

**Tone in one line**
*"Take a breath. Here's what this actually means, and here's your next step."*

---

## 2. Voice & Copy

**We sound like:** a knowledgeable friend sitting beside you at the kitchen table.

**Principles**
- Short sentences. One idea at a time.
- Second person ("you"), present tense, active voice.
- Name the feeling, then move to action: *"This looks intimidating. The good news — you have 30 days, and step one is simple."*
- Never use legalese, jargon, or fear. No "URGENT," no red alarms, no countdown-clock pressure.
- Always end on agency: the user is the one taking the step.

**Microcopy examples**
| Moment | ❌ Avoid | ✅ Use |
|---|---|---|
| Upload | "Submit document for processing" | "Drop it here — we'll take it from here" |
| Loading | "Analyzing…" | "Reading this carefully so you don't have to…" |
| Result | "Summary generated" | "Here's what this means, in plain words" |
| Checklist | "Action items" | "Your next steps" |
| Error | "Processing failed" | "That didn't go through — let's try again together" |

---

## 3. Color Palette

A palette engineered to **reduce cortisol**: soft, desaturated, grounded. No alarm reds, no harsh pure white.

**Primary**
- `--calm-sage` `#7FA99B` — primary brand / trust, growth, steadiness
- `--deep-pine` `#2E4F4A` — headings, primary text on light

**Secondary / Accent**
- `--warm-sand` `#EAE3D6` — surfaces, cards
- `--soft-clay` `#D9A283` — gentle accent, supportive highlights (never warnings)
- `--sky-mist` `#A9C5CE` — secondary actions, info

**Neutrals**
- `--paper` `#FAF7F2` — app background (off-white, never `#FFFFFF`)
- `--ink` `#33403D` — body text (soft charcoal, never pure black)
- `--mist` `#C9D2CE` — borders, dividers

**Functional (used sparingly, muted)**
- `--success` `#6FAE7E`
- `--attention` `#E0B25C` — for time-sensitive notes (warm, not alarming — never red)
- `--info` `#7FA1B8`

> **Rule:** never use saturated red. The whole point is to remove the "danger" signal a stressful document triggers.

---

## 4. Typography

- **Headings:** a humanist serif or soft geometric sans — `Fraunces` or `Source Serif 4`. Approachable authority.
- **Body:** highly legible sans — `Inter` or `Public Sans`. Optimized for stressed, skimming readers.
- **Scale:** generous. Body 17–18px, line-height 1.6+. Big breathing room.
- **Weight:** regular-to-medium for body; avoid heavy bold except for one key takeaway per screen.

---

## 5. Visual & Motion Language

**Layout**
- One primary action per screen. Never overwhelm.
- Lots of whitespace; rounded corners (12–20px radius); soft shadows, no hard edges.
- Progressive disclosure — reveal complexity only when asked.

**Imagery / Iconography**
- Rounded, line-based icons with soft strokes.
- Calm metaphors: stepping stones, sunrise, a steady hand, a path forward.
- Avoid: gavels, stamps, sirens, exclamation marks, stress-stock-photos.

**Motion (anxiety-reducing, not decorative)**
- **Slow and smooth** — 300–500ms eases, gentle `ease-out`. Nothing snappy or jittery.
- **Breathing loader** — during document scanning, a soft pulsing/breathing animation paced like a calm breath (~4s cycle) doubles as a subtle "breathe with me" cue.
- Content fades and rises gently into place; checklist items reveal one at a time so the path feels walkable, not dumped.
- Respect `prefers-reduced-motion`.

---

## 6. The 2026 Look (modern, but never trendy-anxious)

ENVIS should feel like it shipped in 2026 — *quietly* cutting-edge. The trends we adopt are the soft, spatial, AI-native ones; we skip the loud, high-contrast, attention-grabbing ones.

**Surfaces & depth**
- **Soft spatial depth** over flat design — layered cards with large blur radii, low-opacity shadows, and subtle elevation so the UI feels physical and calm, not stacked windows.
- **Frosted/translucent layers** (gentle backdrop-blur, ~16–24px) for overlays, the upload panel, and the result sheet — enough to feel modern, never so much it hurts legibility.
- **Light grain / soft noise texture** (2–4% opacity) over flat fills to kill the sterile "default app" feel and add warmth.
- Big radii (`16–28px`), pill-shaped primary buttons, generous padding.

**AI-native interface**
- Treat the AI as a calm presence, not a chatbot. While ENVIS "thinks," a soft **breathing solid-color disc** (calm-sage) gently scales and fades opacity — the brand's signature moment, no gradient needed.
- **Streaming text** that appears word-by-word as the plain-language summary is written, so it feels alive and considered rather than dumped.
- Checklist steps **self-assemble** one at a time with a soft settle.

**Color, flat and confident — no gradients**
- All surfaces are **solid, flat fills** from the calm palette. Depth comes from layering, shadow, and grain — never from gradients, meshes, or auroras.
- Distinguish layers by **stepping solid tones** (e.g. `--paper` → `--warm-sand` → `--surface`), not by blending between them.
- Subtle **dynamic theming**: the accent swaps to a flat warmer tone (soft-clay) on success states and a flat cooler tone (sky-mist) while reading — discrete color changes, not transitions through a spectrum.

**Type & detail**
- **Variable fonts** with optical sizing (`Fraunces` flexes beautifully) — large display weights for the one key takeaway, light for calm body.
- Fluid type and spacing (`clamp()`-based) so it feels native on any screen.
- Hairline borders + inner highlights for that crisp, premium 2026 edge.

**Dark mode — first-class, not an afterthought**
A true "night calm" theme. Never pure black; deep desaturated greens.

| Token | Light | Dark (Night Calm) |
|---|---|---|
| `--paper` (bg) | `#FAF7F2` | `#161E1C` |
| `--surface` (card) | `#FFFFFF`→`--warm-sand` | `#1E2826` |
| `--ink` (text) | `#33403D` | `#E4E9E6` |
| `--calm-sage` | `#7FA99B` | `#8FBBAC` |
| `--mist` (border) | `#C9D2CE` | `#2C3835` |

> Detect `prefers-color-scheme`; let the user override. Glass and grain effects carry into dark mode at lower opacity.

**Tasteful tactility**
- Buttons depress slightly (scale `0.98`) with a soft spring on press.
- Hover lifts cards `2–4px` with a deepening shadow.
- Optional, opt-in light **haptics** on mobile for step completion.

> **The 2026 line we won't cross:** no neon, no aggressive glassmorphism that strains the eyes, no dense dashboards, no dark-pattern urgency. Modern *here* means calmer, softer, more spatial — technology that recedes so the person can breathe.

---

## 7. Accessibility (a brand value, not a checkbox)

- WCAG AA minimum on all text/contrast pairings.
- Full keyboard navigation and visible focus rings.
- Screen-reader labels on every interactive element and live regions for results.
- Plain-language reading level (aim ~grade 6–8) in all output.
- Scalable text; layouts hold at 200% zoom.

---

## 8. The Promise (how every screen should feel)

1. **Seen** — "We get that this is stressful."
2. **Clear** — "Now I understand what it says."
3. **Capable** — "I know exactly what to do next."
4. **In control** — "I've got this."

If a design decision doesn't move the user along that arc, it doesn't belong in ENVIS.
