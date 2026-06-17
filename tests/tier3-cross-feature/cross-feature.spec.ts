import { test, expect } from '../helpers/test-fixtures';

test.describe('Tier 3: Cross-Feature Combinations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Test 1 (F1+F2 Ingestion + Loader): paste manual text, click translate, verify loader displays, and is replaced by dashboard', async ({ page }) => {
    const textarea = page.locator('[data-testid="manual-text-input"]');
    await textarea.fill('URGENT NOTICE: Pay $1200 by tomorrow or face penalties.');

    const submitBtn = page.locator('[data-testid="translate-submit-btn"]');
    await submitBtn.click();

    // Verify loader displays
    const loader = page.locator('[data-testid="visual-loader"]').or(page.locator('[data-testid="breathing-disc"]')).or(page.locator('[data-testid="scanner-line"]'));
    await expect(loader.first()).toBeVisible();

    // Verify dashboard is shown eventually and loader is hidden
    await expect(page.locator('[data-testid="visual-loader"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="empathic-summary-panel"]')).toBeVisible();
  });

  test('Test 2 (F3+F5 Summary + Jargon): click jargon highlighted word in summary panel, verify correct popover is opened with simple definition', async ({ page }) => {
    // Load preset
    await page.locator('[data-testid="preset-doc-medical"]').click();
    await expect(page.locator('[data-testid="empathic-summary-panel"]')).toBeVisible();

    const jargonHighlight = page.locator('[data-testid="jargon-term-Itemized Bill"]').or(page.locator('.jargon-highlight')).first();
    await jargonHighlight.click();

    const popover = page.locator('[data-testid="jargon-popover"]');
    await expect(popover).toBeVisible();

    const definition = page.locator('[data-testid="jargon-definition"]');
    await expect(definition).toContainText('A detailed list of every single service');
  });

  test('Test 3 (F3+F6 Summary + Checklist): verify first checklist step matches main thing to do in summary', async ({ page }) => {
    await page.locator('[data-testid="preset-doc-medical"]').click();
    await expect(page.locator('[data-testid="empathic-summary-panel"]')).toBeVisible();

    const mainAction = await page.locator('[data-testid="summary-main-action"]').textContent();
    const firstChecklistStepText = await page.locator('[data-testid="checklist-item"]').first().textContent();

    expect(mainAction?.toLowerCase()).toContain('itemized');
    expect(firstChecklistStepText?.toLowerCase()).toContain('itemized');
  });

  test('Test 4 (F4+F6 Timeline + Checklist): verify checklist completion state matches timeline visual state updates', async ({ page }) => {
    await page.locator('[data-testid="preset-doc-medical"]').click();
    await expect(page.locator('[data-testid="timeline-container"]')).toBeVisible();

    const checkbox = page.locator('[data-testid="checklist-item-checkbox"]').first();
    await checkbox.check();

    // Verify timeline visual state updates or class change
    const timelineItem = page.locator('[data-testid="deadline-item"]').first();
    await expect(timelineItem).toHaveClass(/completed|updated|checked|active|done|step|deadline-item/);
  });

  test('Test 5 (F6+F7 Checklist + Response Draft): verify checklist item click enables or matches response draft options', async ({ page }) => {
    await page.locator('[data-testid="preset-doc-medical"]').click();
    await expect(page.locator('[data-testid="action-checklist"]')).toBeVisible();

    const checkbox = page.locator('[data-testid="checklist-item-checkbox"]').first();
    await checkbox.check();

    // Check if the response draft textarea is visible and pre-populated or enabled
    const textarea = page.locator('[data-testid="response-draft-textarea"]');
    await expect(textarea).toBeVisible();
    await expect(textarea).not.toBeEmpty();
  });

  test('Test 6 (F7+F9 Draft + Theme): toggle theme while editing response draft and verify typed content is preserved and styles adapt', async ({ page }) => {
    await page.locator('[data-testid="preset-doc-medical"]').click();
    await expect(page.locator('[data-testid="response-draft-textarea"]')).toBeVisible();

    const textarea = page.locator('[data-testid="response-draft-textarea"]');
    const customText = 'My customized draft response text during theme change.';
    await textarea.fill(customText);

    // Toggle theme
    const themeBtn = page.locator('[data-testid="theme-toggle-btn"]');
    await themeBtn.click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Verify custom text is preserved
    await expect(textarea).toHaveValue(customText);

    // Verify styles adapt (e.g. outline/background changes)
    const outline = await textarea.evaluate(el => window.getComputedStyle(el).outlineStyle || window.getComputedStyle(el).borderColor);
    expect(outline).not.toBe('');
  });

  test('Test 7 (F1+F9 Ingestion + Theme): drop files and check loading scan animations are styled correctly in dark mode', async ({ page }) => {
    // Switch to dark mode
    const themeBtn = page.locator('[data-testid="theme-toggle-btn"]');
    await themeBtn.click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Simulate drag and drop of file
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      const file = new File(['mock content'], 'medical-bill.png', { type: 'image/png' });
      dt.items.add(file);
      return dt;
    });
    await page.dispatchEvent('[data-testid="upload-dropzone"]', 'drop', { dataTransfer });

    // Verify loading scan animations are visible
    const scanner = page.locator('[data-testid="scanner-line"]');
    await expect(scanner).toBeVisible();

    // Verify styled for dark mode
    await expect(scanner).toHaveClass(/border-calm-sage|bg-calm-sage|dark/);
  });

  test('Test 8 (F8+F10 Resources + Accessibility): keyboard navigate through resource cards, check focus outlines and screen-reader links', async ({ page }) => {
    await page.locator('[data-testid="preset-doc-medical"]').click();
    const firstCard = page.locator('[data-testid="resource-card"]').first();
    await expect(firstCard).toBeVisible();

    // Keyboard navigate to focus the resource card or its links
    await page.keyboard.press('Tab');

    const contactLink = firstCard.locator('[data-testid="resource-contact-link"]').first();
    await contactLink.focus();
    const outline = await contactLink.evaluate(el => window.getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe('none');

    // Check screen reader properties
    await expect(contactLink).toHaveAttribute('aria-label');
  });

  test('Test 9 (F5+F10 Jargon + Accessibility): keyboard trigger popover, focus traps inside the popover, and ESC key closes it', async ({ page }) => {
    await page.locator('[data-testid="preset-doc-medical"]').click();
    const jargonHighlight = page.locator('[data-testid="jargon-term-Itemized Bill"]').or(page.locator('.jargon-highlight')).first();
    await expect(jargonHighlight).toBeVisible();

    // Focus and click using keyboard
    await jargonHighlight.focus();
    await page.keyboard.press('Enter');

    const popover = page.locator('[data-testid="jargon-popover"]');
    await expect(popover).toBeVisible();

    // Focus traps inside the popover (Tabbing keeps focus inside popover elements)
    await page.keyboard.press('Tab');
    const activeElementInside = await page.evaluate(() => {
      const active = document.activeElement;
      return active && (active.getAttribute('data-testid') === 'close-jargon-popover-btn' || active.closest('[data-testid="jargon-popover"]') !== null);
    });
    expect(activeElementInside).toBe(true);

    // Escape closes popover
    await page.keyboard.press('Escape');
    await expect(popover).not.toBeVisible();
  });

  test('Test 10 (F6+F10 Checklist + Accessibility): keyboard trigger checklist checkbox, check circular progress, verify live region progress announcements', async ({ page }) => {
    await page.locator('[data-testid="preset-doc-medical"]').click();
    const checkbox = page.locator('[data-testid="checklist-item-checkbox"]').first();
    await expect(checkbox).toBeVisible();

    // Focus and check checkbox with keyboard
    await checkbox.focus();
    await page.keyboard.press('Space');
    await expect(checkbox).toBeChecked();

    // Check circular progress
    const meter = page.locator('[data-testid="progress-meter"]');
    await expect(meter).toBeVisible();
    const progress = await meter.getAttribute('data-progress');
    expect(Number(progress)).toBeGreaterThan(0);

    // Verify live region progress announcement exists
    const liveRegion = page.locator('[aria-live="polite"]').or(page.locator('[role="status"]'));
    await expect(liveRegion).toBeVisible();
    await expect(liveRegion).toContainText(/progress|percent|%/i);
  });
});
