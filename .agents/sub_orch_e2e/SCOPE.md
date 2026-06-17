# Scope: E2E Testing Track for ENVIS

## Architecture
The E2E test suite is designed as an opaque-box, requirement-driven suite using Playwright.
It targets the following features derived from the requirements:
1. **F1: Document Ingestion** (drag-and-drop, manual copy-paste, presets library)
2. **F2: Visual & Motion Loader** (GSAP scan animation, 4-second breathing disc, text streaming, springy items)
3. **F3: Empathic Summary Panel** (plain-language summary: "What is happening?", "Do I need to panic?", "What is the main thing I need to do?")
4. **F4: Timeline & Deadlines** (urgency dates color-coded with `--attention` or `--soft-clay`)
5. **F5: Smart Jargon Decoder** (highlight jargon, hover/click definition popovers)
6. **F6: Step-by-Step Action Checklist** (marking complete updates circular progress indicator)
7. **F7: Response Draft Assistant** (auto-generated draft, tone selection, copy-to-clipboard)
8. **F8: Emergency Resource Directory** (direct help contacts matching document category)
9. **F9: Theme Toggle / Dark Mode** ("Night Calm" theme with deep desaturated green color tokens, light mode warm off-white/sand, toggle override)
10. **F10: Accessibility** (visible focus rings, keyboard navigation, WCAG contrast, screen-reader labels, scalable text)

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| E2E-M1 | Test Harness Setup | Setup Playwright configuration, file structure, package dependencies, mock framework, and verify runner runs on a placeholder/sanity test. Create `TEST_INFRA.md`. | None | PLANNED |
| E2E-M2 | Tier 1 & 2 Tests | Implement Tier 1 (Feature Coverage: 5 tests per feature, total 50 tests) and Tier 2 (Boundary & Corner cases: 5 tests per feature, total 50 tests) based on expected elements and routes. | E2E-M1 | PLANNED |
| E2E-M3 | Tier 3 & 4 Tests | Implement Tier 3 (Cross-feature combinations: pairwise coverage of major feature pairs, at least 10 tests) and Tier 4 (Real-world workloads: 5 scenarios). Publish `TEST_READY.md`. | E2E-M2 | PLANNED |

## Interface Contracts
The tests will interact with the application using standard web selectors, forms, and routes.
- **Home/App Route**: `/`
- **Mock/Test Upload Endpoint**: `/api/translate` and `/api/draft`
- **Expected Selectors (standardized for implementation compatibility)**:
  - Drag-and-Drop Area: `[data-testid="upload-dropzone"]`
  - File Input: `input[type="file"]`
  - Manual Text Textarea: `[data-testid="manual-text-input"]`
  - Submit Button: `[data-testid="translate-submit-btn"]`
  - Preset Document Buttons: `[data-testid^="preset-doc-"]`
  - Loading State / Breathing Sage Disc: `[data-testid="breathing-sage-loader"]`
  - Scanning Progress Bar/Text: `[data-testid="ocr-scanning-progress"]`
  - Empathic Summary Panel: `[data-testid="empathic-summary-panel"]`
  - Urgency/Timeline: `[data-testid="timeline-container"]`, deadline items with `data-testid="deadline-item"`, urgency tags with `--attention` or `--soft-clay` classes / styles.
  - Jargon Decoder: jargon words highlighted as buttons/spans `[data-testid^="jargon-word-"]`, decoder popover `[data-testid="jargon-popover"]`
  - Checklist: checklist container `[data-testid="action-checklist"]`, checklist items with checkboxes `[data-testid^="checklist-item-checkbox-"]`, circular progress indicator `[data-testid="checklist-progress-indicator"]`
  - Response Draft: assistant container `[data-testid="response-draft-assistant"]`, tone options `[data-testid^="tone-btn-"]`, copy-to-clipboard button `[data-testid="copy-draft-btn"]`
  - Resource Directory: directory container `[data-testid="emergency-resource-directory"]`, resource cards `[data-testid="resource-card"]`
  - Theme Toggle: button `[data-testid="theme-toggle-btn"]`, HTML root changes theme class or `data-theme` attribute (e.g. `dark` or `night-calm`)
  - Focus Ring Indicator: check for focus outline classes on keyboard navigation (`:focus-visible`)
