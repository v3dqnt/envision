# Scope: ENVIS Implementation Track

## Architecture
ENVIS is a Next.js (App Router) client-heavy application with serverless Next.js API routes for secure LLM orchestration.
- **Frontend**: React, Next.js, Tailwind CSS, GSAP for custom animations.
- **Client-Side Processing**: Tesseract.js for client-side OCR parsing of uploaded documents (images).
- **Backend API**: Next.js App Router route handlers for communicating with the Gemini or OpenAI API.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Next.js Setup & Layout | Scaffold project, configure Tailwind colors, Fraunces/Inter fonts, grain overlay, and responsive shell. | None | PLANNED |
| M2 | Document Ingestion & OCR | Implement upload portal, client-side OCR parsing with Tesseract.js, presets library, and GSAP scanning animation. | M1 | PLANNED |
| M3 | Calm Dashboard & Decoder | API route for translation, empathic summary panel, timeline/deadlines, jargon decoder with popovers. | M2 | PLANNED |
| M4 | Checklist & Response Draft | Dynamic checklist, circular progress, dynamic response drafting (with tone selection). | M3 | PLANNED |
| M5 | Styling, Dark Mode & Polish | Dark mode ("Night Calm") toggle, accessibility, visible focus rings, 4-second breathing loader, button/card GSAP spring animations. | M4 | PLANNED |
| M6 | E2E Integration (Phase 1) | Run the E2E test suite from Tiers 1-4. Resolve all test failures. | M5 | PLANNED |
| M7 | Adversarial Hardening (Phase 2)| Tier 5 adversarial testing using white-box coverage analysis, fixing gaps. | M6 | PLANNED |

## Interface Contracts

### Translation API Handler (`/api/translate`)
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "text": "string"
  }
  ```
- **Response Body**:
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

### Response Assistant API Handler (`/api/draft`)
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "documentText": "string",
    "tone": "Polite request" | "Formal dispute"
  }
  ```
- **Response Body**:
  ```typescript
  interface DraftResponse {
    draft: string;
  }
  ```
