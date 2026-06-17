# Handoff Report: Milestone E2E-M1 (Test Harness Setup) Plan

**Working Directory**: `c:\Users\v3dqn\Work\Hackathongg\calmsteps_ai\.agents\explorer_e2em1`  
**Milestone**: E2E-M1 Test Harness Setup Plan  
**Target File for Proposal**: `c:\Users\v3dqn\Work\Hackathongg\calmsteps_ai\TEST_INFRA.md`  

---

## 1. Observation

A full read-only investigation of the workspace `c:\Users\v3dqn\Work\Hackathongg\calmsteps_ai` was conducted:
1. **Directory Contents**:
   Using `list_dir`, the root directory was verified to contain only:
   - `.agents/`
   - `PROJECT.md`
   - `brand.md`
   There is no `package.json`, `tsconfig.json`, `tests/` folder, or `playwright.config.ts` currently established in the workspace.
2. **Project Milestones**:
   `PROJECT.md` (Lines 49-51) outlines E2E-M1:
   > `E2E-M1 | Test Harness Setup | E2E Testing | Setup Playwright testing infra, configuration, and a basic test to verify run command. | None | PLANNED`
3. **App Requirements**:
   `PROJECT.md` (Lines 4-7) and `brand.md` specify a client-heavy Next.js App Router application with Tesseract.js client-side OCR parsing, custom theme toggle, and API endpoints at `/api/translate` and `/api/draft`.
4. **Environment Constraints**:
   Network mode is `CODE_ONLY` (no external internet access). Standard NPM install from registry.npmjs.org and Playwright browser binary downloads from Microsoft CDN will fail.
5. **Interactive Commands**:
   `run_command` requests timed out waiting for user approval. Directory listing for `ms-playwright` in `AppData` was blocked.

---

## 2. Logic Chain

1. **Scaffold Prep**: Since the workspace lacks standard configuration files, the test harness requires new specifications for `package.json` dependencies, `tsconfig.e2e.json` isolated types, and `playwright.config.ts`.
2. **Offline OCR Interception**: Since Tesseract.js normally downloads language traineddata files (`.traineddata`) from CDNs, running client-side OCR inside E2E tests in a closed network will fail. To address this, tests must use a Playwright `page.addInitScript` to stub the global `window.Tesseract` worker methods, mock its `recognize` responses, and prevent all CDN-directed network calls.
3. **Host Browser Integration**: In `playwright.config.ts`, we project-map browser launches. In `CODE_ONLY` mode, Playwright's default Chromium downloads cannot be fetched. To circumvent this, we introduce the `PW_OFFLINE` environment variable. When set to `true`, it triggers `channel: 'chrome'` inside the Playwright project config, directing Playwright to run the E2E test suite using the user's pre-installed Google Chrome browser.
4. **Isolated Configs**: Proposing a dedicated `tsconfig.e2e.json` isolates test-specific types (e.g., node, playwright assertions) from the client-side Next.js compilation step, preventing compile errors during production build.

---

## 3. Caveats

- **Host Browser Availability**: The offline bypass assumes that Google Chrome is pre-installed on the Windows host machine at its default location so that Playwright can bind to the `chrome` channel.
- **Local NPM Cache**: It is assumed that the required dependencies (`@playwright/test`, `typescript`, `@types/node`, `ts-node`) are cached locally in the NPM cache, enabling `npm install --offline` or `npm install --prefer-offline` to succeed.
- **Port Conflicts**: The Playwright configuration assumes the Next.js app will run on `http://localhost:3000`. If port 3000 is occupied by another application, the webServer launch will fail.

---

## 4. Conclusion

The testing infrastructure and setup plan have been successfully drafted and written to the agent directory. The proposal includes:
1. **Playwright Config**: `proposed_playwright.config.ts` featuring automatic local dev server management and an offline Google Chrome fallback.
2. **Dependencies**: `proposed_package.json` containing E2E test scripts and required test dependencies.
3. **Isolated TS Compilation**: `proposed_tsconfig.e2e.json` to prevent type collisions.
4. **Mocking Infrastructure**: `proposed_mocks_api_responses.ts` and `proposed_helpers_test_fixtures.ts` to stub OCR and API routes offline.
5. **Infrastructure Document**: `proposed_TEST_INFRA.md` which plans the complete setup structure and execution scripts.

---

## 5. Remaining Work (Soft Handoff)

The testing implementer/worker needs to execute the following steps in the workspace root:

1. **Create TEST_INFRA.md**: Copy the content of `.agents/explorer_e2em1/proposed_TEST_INFRA.md` to `c:\Users\v3dqn\Work\Hackathongg\calmsteps_ai\TEST_INFRA.md`.
2. **Create Tests Folder**:
   Create `c:\Users\v3dqn\Work\Hackathongg\calmsteps_ai\tests\` directory and its subdirectories:
   - `tests/helpers/`
   - `tests/mocks/`
   - `tests/tier1-feature-coverage/`
   - `tests/tier2-boundary-corner/`
   - `tests/tier3-cross-feature/`
   - `tests/tier4-real-world/`
3. **Copy Mock and Fixture Files**:
   - Copy `.agents/explorer_e2em1/proposed_mocks_api_responses.ts` to `tests/mocks/api-responses.ts`.
   - Copy `.agents/explorer_e2em1/proposed_helpers_test_fixtures.ts` to `tests/helpers/test-fixtures.ts`.
4. **Merge package.json**: Merge the scripts and devDependencies from `.agents/explorer_e2em1/proposed_package.json` into the main `package.json` once created.
5. **Write TSConfig and Playwright Config**:
   - Copy `.agents/explorer_e2em1/proposed_tsconfig.e2e.json` to `tsconfig.e2e.json`.
   - Copy `.agents/explorer_e2em1/proposed_playwright.config.ts` to `playwright.config.ts`.
6. **Perform Offline Install**:
   In PowerShell, run:
   ```powershell
   npm install --offline --prefer-offline
   ```

---

## 6. Verification Method

1. **Verify Config Presence**:
   Confirm that `TEST_INFRA.md`, `tsconfig.e2e.json`, `playwright.config.ts`, `tests/mocks/api-responses.ts`, and `tests/helpers/test-fixtures.ts` exist.
2. **Verify Playwright Runs Offline**:
   Run the test command in PowerShell with the offline override env var set:
   ```powershell
   $env:PW_OFFLINE="true"
   npx playwright test --project=chromium
   ```
   Verify that Playwright launches, runs tests using the local Chrome channel, and outputs results.
