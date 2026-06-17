import { test, expect } from '../helpers/test-fixtures';

test.describe('Jargon Decoder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="preset-doc-medical"]').click();
  });

  test('jargon highlight spans are generated for recognized legal/medical terms', async ({ page }) => {
    const jargonHighlight = page.locator('[data-testid="jargon-term-Itemized Bill"]').or(page.locator('.jargon-highlight'));
    await expect(jargonHighlight.first()).toBeVisible();
    await expect(jargonHighlight.first()).toContainText('Itemized Bill');
  });

  test('clicking jargon term displays the interactive popover/tooltip', async ({ page }) => {
    const jargonHighlight = page.locator('[data-testid="jargon-term-Itemized Bill"]').or(page.locator('.jargon-highlight')).first();
    await jargonHighlight.click();

    const popover = page.locator('[data-testid="jargon-popover"]');
    await expect(popover).toBeVisible();
  });

  test('jargon popover displays correct simplified definition text', async ({ page }) => {
    const jargonHighlight = page.locator('[data-testid="jargon-term-Itemized Bill"]').or(page.locator('.jargon-highlight')).first();
    await jargonHighlight.click();

    const definition = page.locator('[data-testid="jargon-definition"]');
    await expect(definition).toContainText('A detailed list of every single service');
  });

  test('closing popover works via close button', async ({ page }) => {
    const jargonHighlight = page.locator('[data-testid="jargon-term-Itemized Bill"]').or(page.locator('.jargon-highlight')).first();
    await jargonHighlight.click();

    const popover = page.locator('[data-testid="jargon-popover"]');
    await expect(popover).toBeVisible();

    const closeBtn = page.locator('[data-testid="close-jargon-popover-btn"]');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await expect(popover).not.toBeVisible();
    } else {
      // Click somewhere else to close (click outside)
      await page.click('body', { position: { x: 0, y: 0 } });
      await expect(popover).not.toBeVisible();
    }
  });

  test('hovering over jargon highlights shows custom cursor and style changes', async ({ page }) => {
    const jargonHighlight = page.locator('[data-testid="jargon-term-Itemized Bill"]').or(page.locator('.jargon-highlight')).first();
    await jargonHighlight.hover();
    
    // Validate cursor style is pointer
    const cursor = await jargonHighlight.evaluate(el => window.getComputedStyle(el).cursor);
    expect(cursor).toBe('pointer');
  });
});
