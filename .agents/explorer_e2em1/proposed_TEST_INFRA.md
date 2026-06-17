# ENVIS — E2E Testing Infrastructure (Playwright)

This document outlines the testing architecture, directory layout, execution scripts, mocking framework, and offline/off-grid deployment strategy for the ENVIS E2E test suite.

---

## 1. Overview
The E2E test suite for ENVIS is designed as an **opaque-box, requirement-driven harness** using Playwright. It validates the user interface, tone guidelines, state transitions, dynamic checklist progress, API integration, theme toggle ("Night Calm"), and accessibility requirements (F1–F10) without relying on live LLM or CDN connections.

---

## 2. Directory Layout
We organize the test suite into distinct tiers under the `tests/` directory to separate concerns and handle progressive validation:

```text
tests/
├── helpers/
│   └── test-fixtures.ts             # Custom Playwright fixtures, page objects, and global stubbing helpers
├── mocks/
│   ├── api-responses.ts             # Predefined mock payloads for /api/translate and /api/draft
│   └── ocr-mock.ts                  # Mock file and text inputs for client-side OCR stubbing
├── tier1-feature-coverage/          # Tier 1: Core functionality checks (5 tests per feature, 50 total)
│   ├── f1-document-ingestion.spec.ts
│   ├── f2-visual-loader.spec.ts
│   ├── f3-empathic-summary.spec.ts
│   ├── f4-timeline-deadlines.spec.ts
│   ├── f5-jargon-decoder.spec.ts
│   ├── f6-action-checklist.spec.ts
│   ├── f7-response-draft.spec.ts
│   ├── f8-emergency-resources.spec.ts
│   ├── f9-theme-toggle.spec.ts
│   └── f10-accessibility.spec.ts
├── tier2-boundary-corner/           # Tier 2: Boundary, error, and corner cases (5 tests per feature, 50 total)
│   ├── f1-document-ingestion.boundary.spec.ts
│   ├── f2-visual-loader.boundary.spec.ts
│   ├── f3-empathic-summary.boundary.spec.ts
│   ├── f4-timeline-deadlines.boundary.spec.ts
│   ├── f5-jargon-decoder.boundary.spec.ts
│   ├── f6-action-checklist.boundary.spec.ts
│   ├── f7-response-draft.boundary.spec.ts
│   ├── f8-emergency-resources.boundary.spec.ts
│   ├── f9-theme-toggle.boundary.spec.ts
│   └── f10-accessibility.boundary.spec.ts
├── tier3-cross-feature/
│   └── cross-feature.spec.ts        # Tier 3: Interactions between features (10 combination scenarios)
└── tier4-real-world/
    └── scenarios.spec.ts            # Tier 4: Extended end-to-end user workloads (5 scenarios)
```

---

## 3. Configuration

### 3.1. package.json Dependencies
The test suite utilizes Playwright and TypeScript for static checking and compilation:
```json
{
  "devDependencies": {
    "@playwright/test": "^1.44.0",
    "@types/node": "^20.12.12",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.5"
  },
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report"
  }
}
```

### 3.2. tsconfig.e2e.json
We isolate the E2E test compilation to avoid polluting Next.js client-side bundles with Node-specific typing:
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "target": "es2022",
    "moduleResolution": "node",
    "noEmit": false
  },
  "include": ["tests/**/*.ts", "tests/**/*.tsx"]
}
```

### 3.3. playwright.config.ts
This configuration automatically manages the local Next.js dev server lifecycle:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Uses the host system's Google Chrome in off-grid environments
        channel: process.env.PW_OFFLINE ? 'chrome' : undefined,
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

---

## 4. API & Client-Side Mocking Strategy

### 4.1. Next.js API Routes Interception
To avoid querying live LLMs during test runs, we intercept the App Router endpoints. Put this setup in a global test fixture:
```typescript
import { test as base } from '@playwright/test';
import { MOCK_TRANSLATION_RESPONSE, MOCK_DRAFT_RESPONSE } from '../mocks/api-responses';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Intercept translation endpoint
    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_TRANSLATION_RESPONSE),
      });
    });

    // Intercept response draft endpoint
    await page.route('**/api/draft', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_DRAFT_RESPONSE),
      });
    });

    await use(page);
  },
});
```

### 4.2. Client-Side OCR (Tesseract.js) Mocking
Tesseract.js fetches large `.traineddata` language files from external CDNs by default. In a closed network (`CODE_ONLY`), this will fail and break ingestion testing. 
To bypass this, tests should stub out the client-side `Tesseract` worker methods:
```typescript
await page.addInitScript(() => {
  // Inject stub on the window object before the application scripts load
  window['Tesseract'] = {
    recognize: async (image, langs, options) => {
      return {
        data: {
          text: "MOCK OCR TEXT CONTENT: Account Number 12345. Hospital Bill total is $1200.00. Payment due by July 16, 2026.",
          confidence: 95
        }
      };
    },
    createWorker: async () => {
      return {
        loadLanguage: async () => {},
        initialize: async () => {},
        recognize: async () => ({
          data: { text: "MOCK OCR TEXT" }
        }),
        terminate: async () => {}
      };
    }
  };
});
```
This guarantees fast, 100% off-grid client-side OCR parsing that mimics successful scans.

---

## 5. Offline/CODE_ONLY Execution Guide

Since the development environment operates in **CODE_ONLY network mode**, standard internet fetches are disabled. Follow these procedures to initialize and run E2E tests:

1. **Local Package Installation**:
   Run the NPM install command telling it to pull exclusively from local cache or prefer local offline packages:
   ```powershell
   npm install --offline --prefer-offline
   ```
2. **Playwright Browser Bypass**:
   Since downloading browser binaries (`npx playwright install`) is not possible without an internet connection, run the Chromium project using the host machine's pre-installed Google Chrome:
   ```powershell
   $env:PW_OFFLINE="true"
   npx playwright test --project=chromium
   ```
   Setting `PW_OFFLINE="true"` triggers the `channel: 'chrome'` directive in `playwright.config.ts`, linking Playwright directly to the user's standard Chrome installation.
