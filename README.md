# ENVIS — Crisis-to-Action Translator

> Take a breath. We'll handle the scary paperwork.

ENVIS turns the documents that make hearts race — a food-assistance notice, a hospital discharge sheet, a benefits letter, a medical bill — into **plain language, a checklist, and clear next steps**, then connects the person to **real help nearby and the support they qualify for.**

**USAII Global AI Hackathon 2026 · High School Track · Challenge 1 ("Help Is Hard to Find") · Direction A: Crisis-to-Action Translator**

---

## 1. The problem & who we built for

Every community has support — food assistance, clinics, housing help, school programs — but people miss out **not because help doesn't exist, but because the paperwork is confusing, the language is dense, and the systems aren't built for people under stress.**

**Our specific user — Maria.** Maria is a single parent. She opens a letter from the state: a **SNAP food-assistance recertification notice.** Buried in bureaucratic wording is one thing that actually matters: *send proof of income, rent, and household size by July 10, or your benefits stop.* She's stressed, short on time, and unsure what counts as "proof" or where to go. Miss the date and her family loses food support.

ENVIS is for Maria — and the parent with an eviction notice, the patient holding discharge instructions in a language they barely read, the family staring at a hospital bill.

---

## 2. How the AI works (input → AI → output)

```
  ┌─────────────┐     ┌───────────────────────────────┐     ┌────────────────────────────┐
  │   INPUTS    │ ──▶ │        AI PROCESSING          │ ──▶ │          OUTPUTS           │
  ├─────────────┤     ├───────────────────────────────┤     ├────────────────────────────┤
  │ • Pasted    │     │ Reasoning advisor (GPT-5,     │     │ • Plain-language breakdown │
  │   text      │     │   high reasoning effort)      │     │   (bottom line → what      │
  │ • Photo of  │     │ Client-side OCR (Tesseract)   │     │   stands out → line-by-    │
  │   a doc     │     │ Per-line annotation pass      │     │   line → your move)        │
  │ • Follow-up │     │ Tool-calling (reminders/todos)│     │ • Color-coded highlights   │
  │   files     │     │ Multi-agent web research      │     │   on the document image    │
  │             │     │   (LangGraph + Tavily)        │     │ • Auto-saved checklist     │
  │             │     │ Eligibility matching          │     │ • Nearby support (3D map)  │
  │             │     │ Localized geo + benefits      │     │ • Programs you qualify for │
  │             │     │ Translation (8 languages)     │     │ • A ready-to-send email    │
  └─────────────┘     └───────────────────────────────┘     └────────────────────────────┘
```

**AI capabilities used:** Generative AI (plain-language explanation + drafting), Summarization, Classification (severity/urgency tagging, scam/relevance judgments), Retrieval (Tavily web search + OpenStreetMap places), Recommendation (which support + programs fit), Translation.

**The flow, step by step:**
1. **Ingest** — paste text, or upload a photo. Images are OCR'd **in the browser** (Tesseract.js) so the document text never has to leave the device just to be read.
2. **Reason** — the core advisor (GPT-5, `reasoning_effort: high`) reads the document like a knowledgeable friend: it identifies *what it is*, *what matters most*, *what's off*, and *the one thing to do*. It is prompted to **reason, not dictate** — it judges the actual numbers/dates in front of it and localizes to the document's country and norms.
3. **Explain visually** — a second model pass labels each OCR'd line with a plain meaning and a 🔵 key / 🟡 watch-out / 🟢 good tag, overlaid on the image. Cached per document so it's computed once.
4. **Turn understanding into action** — via tool-calling, the advisor writes the user's checklist (todos) and deadlines (reminders) straight to their account.
5. **Find support** — when relevant, a 3D map (MapTiler + OpenStreetMap) shows real nearby food banks / clinics / offices, and an eligibility finder lists assistance programs the person may qualify for, localized to their region.
6. **Act** — ENVIS drafts the response email (polite or firm) and hands it to the user to review and send from their own inbox.

### Why AI — and not just a web search
A web search returns generic articles about "what is SNAP." It cannot read **Maria's specific letter**, tell her that **her** deadline is July 10, judge whether **her** $2,118 charge is inflated for **her** city, draft **her** reply with **her** case number, or translate **her** breakdown into **her** language. ENVIS reasons over the user's *own* document and situation — that's the whole point, and it's something search fundamentally can't do.

---

## 3. Responsible AI (all three required elements)

1. **One realistic risk — incorrect or over-trusted advice.** A language model can misread a figure, misstate a local rule, or sound confident while being wrong. For someone under stress facing a legal/medical/financial document, blindly trusting it could cause real harm (missing a real deadline, mishandling medication).

2. **One concrete mitigation — confidence + source transparency, and an explicit scope limit.** ENVIS is prompted to **signal uncertainty** ("roughly", "this varies", "confirm with the official source") instead of stating guesses as facts. The research agent **shows its sources** (real URLs) so claims are checkable. A persistent on-screen notice states that ENVIS *explains and suggests — it does not make legal, medical, or financial decisions.* It also flags possible scams and tells the user how to verify before paying or sharing anything.

3. **Human-in-the-loop — ENVIS never acts on the user's behalf.** The one decision the AI does **not** make is *committing*: it never sends an email, submits a form, or pays a bill. It prepares the draft and opens the user's own email for them to review and send. A human stays in control because these are consequential, irreversible actions tied to someone's health, housing, money, and legal standing — exactly where judgment must remain with the person.

---

## 4. Tools, models & data

**Models / AI (all via paid OpenAI API key):** OpenAI **GPT-5** (advisor, drafting, eligibility — high reasoning), **GPT-5-mini** (annotations, labelling, planning).
**Free / open-source:** Tesseract.js (OCR), LangGraph + LangChain (multi-agent orchestration), MapLibre GL + OpenStreetMap/Overpass (map + places), Next.js, React, Tailwind, GSAP.
**Free-tier APIs:** **Tavily** (web search), **MapTiler** (map tiles/geocoding), **Supabase** (auth + Postgres + row-level security).
**AI coding assistance:** built with the help of an AI pair-programmer (disclosed per the rules).

**Data disclosure:** No real personal data. The sample documents (medical bill, SNAP notice, school attendance letter, eviction/debt notices) are **synthetic** examples written to mirror real document formats. Live data comes from public sources only: OpenStreetMap (places) and the open web via Tavily (institution policies). User-uploaded documents are processed for the user's own session; image OCR happens client-side.

---

## 5. Feature map (and the reasoning behind each)

| Feature | What it does | Why it's built this way |
|---|---|---|
| Reasoning advisor | Plain-language analysis + checklist + next steps | Reasoning-first prompt so it judges *your* document, not boilerplate |
| Document highlights | Per-line meaning on the image, color-coded | Uses **real OCR coordinates**, not model-guessed positions; cached to save tokens |
| Reminders & to-dos | Advisor auto-creates them via tool-calling | Understanding is useless without action; written under the user's own RLS |
| "My rights" research | LangGraph planner → parallel sub-agents → synthesis (Tavily) | Finds institution policies/rights *in the user's favour*, with sources |
| Find support (3D map) | Real nearby food banks/clinics/offices | The "find" half of the mission, made tangible and local |
| Eligibility finder | Programs you may qualify for, localized | Moves from "what exists" to "what *you* can claim" |
| Response draft + send | Drafts the email; you review & send | Closes the loop — human-in-the-loop by design |
| Translation | Any reply in 8 languages | Stress + a second language is the hardest case |
| Contextual tools | Support/eligibility shown only when relevant | Avoids noise; respects the specific problem |

---

## 6. Running it locally

```bash
npm install --legacy-peer-deps
# create .env.local with:
#   OPENAI_API_KEY=...
#   NEXT_PUBLIC_SUPABASE_URL=...        NEXT_PUBLIC_SUPABASE_ANON_KEY=...
#   TAVILY_API_KEY=...                  NEXT_PUBLIC_MAPTILER_API_KEY=...
# run the schema in supabase_setup.sql in the Supabase SQL editor
npm run dev
```

The app degrades gracefully without the optional keys (auth/maps/research switch off; the core advisor still works).

---

## 7. Honest limitations

- OCR struggles on low-quality photos; pasted text is most reliable.
- The model can be wrong — that's *why* the safeguards and human-in-the-loop above exist.
- Eligibility/research are starting points to verify, not official determinations.
- ENVIS is an understanding-and-action aid, **not** a lawyer, doctor, or caseworker.

---

## 8. Architecture

Next.js (App Router) · React · Tailwind · Supabase (auth + Postgres + RLS). Serverless API routes: `/api/chat` (advisor + tools), `/api/annotate`, `/api/draft`, `/api/localize`, `/api/research` (LangGraph + Tavily), `/api/eligibility`, `/api/support-plan`, `/api/thread-meta`. Client OCR via Tesseract.js; 3D map via MapTiler/MapLibre over OpenStreetMap.
