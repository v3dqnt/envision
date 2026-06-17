# Test Readiness Report (TEST_READY.md)

## Test Execution Command
The following command runs the entire E2E test suite:
```bash
npx playwright test
```

For offline/off-grid (`CODE_ONLY`) environments using the pre-installed system Chrome:
```powershell
$env:PW_OFFLINE="true"
npx playwright test --project=chromium
```

## Feature Inventory & E2E Coverage Checklist

### Tier 1: Core Feature Coverage
- [x] **F1: Document Ingestion** (`tests/tier1-feature-coverage/f1-document-ingestion.spec.ts`)
  - Drag-and-drop triggers upload state
  - Manual text input and submission
  - Preset library loads sample docs
  - File input accepts documents and updates display
  - Clear buttons reset input state
- [x] **F2: Visual Loader** (`tests/tier1-feature-coverage/f2-visual-loader.spec.ts`)
  - GSAP scanning animation present during loading
  - Breathing sage disc pulses during loading
  - Loading completes: hides loader, shows results
  - Checklist items fade-in sequentially
  - prefers-reduced-motion media query disables loading animations
- [x] **F3: Empathic Summary** (`tests/tier1-feature-coverage/f3-empathic-summary.spec.ts`)
  - Summary panel layout check
  - "What is happening" section populated
  - "Do I need to panic" section populated
  - "Main thing to do" section populated
  - Streaming text effect displays characters incrementally
- [x] **F4: Timeline & Deadlines** (`tests/tier1-feature-coverage/f4-timeline-deadlines.spec.ts`)
  - Timeline container is rendered
  - Deadline items show dates and descriptions
  - Urgency color formats match urgency level (high/medium/low)
  - Deadlines sorted chronologically
  - Timeline nodes connected by connector line
- [x] **F5: Jargon Decoder** (`tests/tier1-feature-coverage/f5-jargon-decoder.spec.ts`)
  - Jargon highlight spans generated
  - Clicking jargon term displays popover/tooltip
  - Popover displays simple definition text
  - Closing popover works via close button or click outside
  - Hovering shows custom pointer style
- [x] **F6: Action Checklist** (`tests/tier1-feature-coverage/f6-action-checklist.spec.ts`)
  - Checklist shows all translated steps
  - Checking boxes marks steps completed
  - Progress meter matches completion percentage
  - Clicking step expansion shows details/rationale
  - Unchecking boxes decrements progress
- [x] **F7: Response Draft** (`tests/tier1-feature-coverage/f7-response-draft.spec.ts`)
  - Draft textarea is rendered and prepopulated
  - Copy to clipboard works
  - Tone selectors trigger tone variations
  - Manual edits allowed and preserved
  - Response draft updates on new preset loading
- [x] **F8: Emergency Resources** (`tests/tier1-feature-coverage/f8-emergency-resources.spec.ts`)
  - Resource cards rendered
  - Cards contain name, contact, and description
  - Click contact triggers tel: or mailto: schema
  - Resources match category of parsed document
  - External links open in new tab with noopener/noreferrer
- [x] **F9: Theme Toggle** (`tests/tier1-feature-coverage/f9-theme-toggle.spec.ts`)
  - Toggle changes theme attributes and icons
  - Dark theme uses desaturated green background (`#161E1C`)
  - Light theme uses warm sand/paper background (`#FAF7F2`)
  - Preference persists across reloads via localStorage
  - Critical elements have borders for contrast compliance
- [x] **F10: Accessibility** (`tests/tier1-feature-coverage/f10-accessibility.spec.ts`)
  - Focus outlines are visible
  - Page sections have ARIA roles/labels
  - Zoom simulation layout adjusts gracefully
  - Tab navigation order is logical
  - Text colors meet contrast requirements

### Tier 2: Boundary & Corner Cases
- [x] **F1-F10 boundary specs** (`tests/tier2-boundary-corner/`)
  - Handling invalid file types and large files
  - Graceful handling of OCR engine failures
  - Empty text area submission blocked
  - Sequential/rapid clicks handling, focus traps, focus loops, scroll containers

### Tier 3: Cross-Feature Interactions
- [x] **Combination tests** (`tests/tier3-cross-feature/cross-feature.spec.ts`)
  - Test 1 (F1+F2 Ingestion + Loader): paste manual text, click translate, verify loader displays, and is replaced by dashboard.
  - Test 2 (F3+F5 Summary + Jargon): click jargon highlighted word in summary panel, verify correct popover is opened with simple definition.
  - Test 3 (F3+F6 Summary + Checklist): verify first checklist step matches main thing to do in summary.
  - Test 4 (F4+F6 Timeline + Checklist): verify checklist completion state matches timeline visual state updates.
  - Test 5 (F6+F7 Checklist + Response Draft): verify checklist item click enables or matches response draft options.
  - Test 6 (F7+F9 Draft + Theme): toggle theme while editing response draft and verify typed content is preserved and styles adapt.
  - Test 7 (F1+F9 Ingestion + Theme): drop files and check loading scan animations are styled correctly in dark mode.
  - Test 8 (F8+F10 Resources + Accessibility): keyboard navigate through resource cards, check focus outlines and screen-reader links.
  - Test 9 (F5+F10 Jargon + Accessibility): keyboard trigger popover, focus traps inside the popover, and ESC key closes it.
  - Test 10 (F6+F10 Checklist + Accessibility): keyboard trigger checklist checkbox, check circular progress, verify live region progress announcements.

### Tier 4: Real-World Application Scenarios
- [x] **Extended user workloads** (`tests/tier4-real-world/scenarios.spec.ts`)
  - Scenario 1 (Medical Bill Negotiation Flow): select hospital bill preset, check summary/deadlines, hover-decode "Itemized Bill", complete step 1 checklist, generate "Polite request" tone draft, copy to clipboard, verify Patient Advocate resources.
  - Scenario 2 (Eviction Warning Flow): select eviction warning preset, verify short 3-day deadline attention styles, decode "Unlawful Detainer", checklist checks, generate "Formal dispute" tone draft, locate tenant resources.
  - Scenario 3 (Debt Collector Verification Flow): manually enter collection text, view summary, decode "Debt Verification", edit draft response, copy draft, switch to dark mode, verify resources.
  - Scenario 4 (Suspension Appeal Flow): drop mock suspension file, see timeline hear dates, request records checklist, set "Appeal" tone draft, verify keyboard focus loops through all main dashboard items.
  - Scenario 5 (Utility Shut-off extension Flow): upload utility bill image (mock OCR), verify payment plan summary, LIHEAP resources, copy draft extension request.

## Expected Test Results (TDD Red State)
All implemented tests currently run and fail as expected (TDD red state). The tests assert elements, attributes, and user flows that will be fully implemented in the upcoming implementation phases (Milestones M1–M5). The test suites compile perfectly and are fully integrated into the Playwright harness, ready to validate the system under test.
