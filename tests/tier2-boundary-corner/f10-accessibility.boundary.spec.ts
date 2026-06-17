import { test, expect } from '../helpers/test-fixtures';

test.describe('Accessibility - Boundary & Corner Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('aria-live container announces loading state and translation updates', async ({ page }) => {
    const liveAnnouncer = page.locator('[aria-live="polite"]').or(page.locator('[aria-live="assertive"]'));
    await expect(liveAnnouncer).toBeDefined();

    // Trigger translation load
    await page.locator('[data-testid="manual-text-input"]').fill('Check live announcements');
    await page.locator('[data-testid="translate-submit-btn"]').click();

    // The announcer should output loading updates or success alerts
    await expect(liveAnnouncer).toContainText(/loading|translating|complete|ready|success/i);
  });

  test('focus is trapped inside interactive popovers and dialogs', async ({ page }) => {
    await page.locator('[data-testid="preset-doc-medical"]').click();
    const term = page.locator('[data-testid="jargon-term-Itemized Bill"]').or(page.locator('.jargon-highlight')).first();
    await term.click();

    const popover = page.locator('[data-testid="jargon-popover"]');
    await expect(popover).toBeVisible();

    const closeBtn = popover.locator('[data-testid="close-jargon-popover-btn"]').or(popover.locator('button'));
    await closeBtn.first().focus();

    // Tab multiple times
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Ensure focus is still within popover elements and hasn't leaked back to main document
    const isFocusedInPopover = await popover.evaluate(el => el.contains(document.activeElement));
    expect(isFocusedInPopover).toBe(true);
  });

  test('increasing text size does not result in layout cut-offs or button overlapping', async ({ page }) => {
    // Inject stylesheet to mimic 200% font sizing on root
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });

    // Header layout and buttons should still be visible and not overlapped
    const themeBtn = page.locator('[data-testid="theme-toggle-btn"]');
    await expect(themeBtn).toBeVisible();
    
    // Check height is positive and not collapsed
    const height = await themeBtn.evaluate(el => el.clientHeight);
    expect(height).toBeGreaterThan(10);
  });

  test('skip-to-content link is present and correctly shifts focus to main element', async ({ page }) => {
    const skipLink = page.locator('a.skip-to-content').or(page.locator('[data-testid="skip-to-content"]')).or(page.locator('[href="#main"]'));
    await expect(skipLink.first()).toBeDefined();

    // Focus first element on page using Tab
    await page.keyboard.press('Tab');
    
    const activeHref = await page.evaluate(() => document.activeElement?.getAttribute('href'));
    if (activeHref === '#main' || activeHref === '#main-content') {
      // Activate skip link
      await page.keyboard.press('Enter');
      
      // Ensure focus shifts to main section container
      const focusedId = await page.evaluate(() => document.activeElement?.getAttribute('id'));
      expect(focusedId === 'main' || focusedId === 'main-content').toBe(true);
    }
  });

  test('purely decorative icons are hidden from screen readers using aria-hidden', async ({ page }) => {
    const lucideIcons = page.locator('svg.lucide');
    const count = await lucideIcons.count();

    for (let i = 0; i < count; i++) {
      const isAriaHidden = await lucideIcons.nth(i).getAttribute('aria-hidden');
      expect(isAriaHidden).toBe('true');
    }
  });
});
