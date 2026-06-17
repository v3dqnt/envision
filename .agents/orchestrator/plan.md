# Execution Plan: ENVIS (Crisis-to-Action Translator)

We will execute the project using a dual-track Project Orchestrator pattern.
The top-level orchestrator will spawn two tracks in parallel:
1. **E2E Testing Track**: To establish testing infrastructure and write opaque-box requirements-driven tests.
2. **Implementation Track**: To scaffold, implement features, integrate API routes, and pass testing gates.

## Step-by-Step Milestones & Verification

### Phase 1: Planning and Setup (Orchestrator)
- [x] Create project files (`PROJECT.md`, `ORIGINAL_REQUEST.md`, `BRIEFING.md`).
- [ ] Create `plan.md` and `progress.md`.
- [ ] Start heartbeat cron and configure tracking.

### Phase 2: Parallel Track Execution (Sub-orchestrators)
- [ ] **Track A: E2E Testing Track**
  - **E2E-M1**: Test Harness Setup (Playwright install, sample test config).
  - **E2E-M2**: Tier 1 (Feature coverage) and Tier 2 (Boundary cases) tests for document ingestion, dashboard, decoder, draft assistant, emergency resources.
  - **E2E-M3**: Tier 3 (Cross-feature interactions) and Tier 4 (Real-world workloads).
  - **TEST_READY.md**: Publish test suite ready file.
- [ ] **Track B: Implementation Track**
  - **M1**: Setup Next.js boilerplate, configure Tailwind colors, typography, global layout (noise filter, background).
  - **M2**: OCR portal with drag-and-drop file ingestion, client-side Tesseract.js text extraction, preset library, GSAP scanning progress bar.
  - **M3**: API route for LLM translation, empathic summary component, timeline with coded urgency tags, jargon decoder using hovers.
  - **M4**: Dynamic step checklist with progress ring, tone-based response draft assistant with dynamic APIs.
  - **M5**: Light/Dark theme toggle support, keyboard focus outline/accessibility, breathing loader scale animation, GSAP spring hover lifts.
  - **M6**: E2E Integration (Phase 1) - run all Tiers 1-4 tests and iterate until 100% pass rate.
  - **M7**: Adversarial Hardening (Phase 2) - run white-box analysis, identify coverage gaps, write adversarial tests, resolve defects.

### Phase 3: Final Build & Audit Verification
- [ ] Run production build (`next build`) to ensure compile success with no ESLint/TS errors.
- [ ] Dispatch a Forensic Auditor to ensure no dummy logic or hardcoded outputs exist.
- [ ] Present completed dashboard screenshots/results to user and complete handoff.
