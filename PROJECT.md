# Project: ENVIS - Crisis-to-Action Translator

## Architecture
ENVIS is a Next.js (App Router) client-heavy application with serverless Next.js API routes for secure LLM orchestration.
- **Frontend**: React, Next.js, Tailwind CSS, GSAP for custom animations.
- **Client-Side Processing**: Tesseract.js for client-side OCR parsing of uploaded documents (images).
- **Backend API**: Next.js App Router route handlers for communicating with the Gemini or OpenAI API.
- **Shared Interfaces / Contracts**:
  - OCR Output: `{ text: string, status: 'success' | 'error', error?: string }`
  - Translation Output (JSON schema returned by LLM):
    ```typescript
    interface TranslationResponse {
      summary: {
        whatIsHappening: string;
        doINeedToPanic: string;
        mainThingToDo: string;
      };
      deadlines: Array<{
        date: string;
        description: string;
        urgency: 'high' | 'medium' | 'low';
      }>;
      jargon: Array<{
        term: string;
        simpleDefinition: string;
      }>;
      checklist: Array<{
        id: string;
        step: string;
        rationale: string;
      }>;
      emergencyResources: Array<{
        name: string;
        contact: string;
        description: string;
      }>;
    }
    ```
  - Draft Generator API (`/api/draft`) Output:
    ```typescript
    interface DraftResponse {
      draft: string;
    }
    ```

## Milestones
| # | Name | Track | Scope | Dependencies | Status |
|---|------|-------|-------|--------------|--------|
| E2E-M1 | Test Harness Setup | E2E Testing | Setup Playwright testing infra, configuration, and a basic test to verify run command. | None | PLANNED |
| E2E-M2 | Tier 1 & 2 Tests | E2E Testing | Write tests for R3, R4, R5 requirements, designed opaque-box. | E2E-M1 | PLANNED |
| E2E-M3 | Tier 3 & 4 Tests | E2E Testing | Write cross-feature combinations and real-world application workloads. Publish TEST_READY.md. | E2E-M2 | PLANNED |
| M1 | Next.js Setup & Layout | Implementation | Scaffold project, configure Tailwind colors, Fraunces/Inter fonts, grain overlay, and responsive shell. | None | PLANNED |
| M2 | Document Ingestion & OCR | Implementation | Implement upload portal, client-side OCR parsing with Tesseract.js, presets library, and GSAP scanning animation. | M1 | PLANNED |
| M3 | Calm Dashboard & Decoder | Implementation | API route for translation, empathic summary panel, timeline/deadlines, jargon decoder with popovers. | M2 | PLANNED |
| M4 | Checklist & Response Draft | Implementation | Dynamic checklist, circular progress, dynamic response drafting (with tone selection). | M3 | PLANNED |
| M5 | Styling, Dark Mode & Polish | Implementation | Dark mode ("Night Calm") toggle, accessibility, visible focus rings, 4-second breathing loader, button/card GSAP spring animations. | M4 | PLANNED |
| M6 | E2E Integration (Phase 1) | Implementation | Run the E2E test suite from Tiers 1-4. Resolve all test failures. | M5, E2E-M3 | PLANNED |
| M7 | Adversarial Hardening (Phase 2)| Implementation | Tier 5 adversarial testing using white-box coverage analysis, fixing gaps. | M6 | PLANNED |

## Code Layout
- `src/app/` - Pages and API routes
  - `src/app/layout.tsx` - App layout with fonts, grain overlay, and theme provider
  - `src/app/page.tsx` - Main app portal (upload, processing, dashboard container)
  - `src/app/api/translate/route.ts` - Translation API endpoint
  - `src/app/api/draft/route.ts` - Tone draft generation API endpoint
- `src/components/` - Reusable UI components
  - `src/components/ui/` - Basic layout elements (Card, Button, Popover, Progress)
  - `src/components/UploadPortal.tsx` - Ingestion, presets, manual copy-paste
  - `src/components/Dashboard.tsx` - Layout holding summary, timeline, checklist, draft, resources
  - `src/components/JargonDecoder.tsx` - Renders translation text with hover decoder popovers
  - `src/components/ResponseAssistant.tsx` - Renders draft, copy-to-clipboard, tone selector
  - `src/components/Loader.tsx` - The 4s breathing sage circle loader
- `tests/` - E2E Playwright test suite
