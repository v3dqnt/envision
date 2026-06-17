import { test, expect } from '../helpers/test-fixtures';

test.describe('Jargon Decoder - Boundary & Corner Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('no jargon terms in translation results handles clean document rendering', async ({ page }) => {
    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: { whatIsHappening: "Plain summary without jargon.", doINeedToPanic: "No", mainThingToDo: "None" },
          deadlines: [], jargon: [], checklist: [], emergencyResources: []
        }),
      });
    });

    await page.locator('[data-testid="preset-doc-medical"]').click();
    const highlights = page.locator('.jargon-highlight');
    await expect(highlights).toHaveCount(0);
  });

  test('mobile popover placement adjusts relative coordinates to avoid screen clipping', async ({ page }) => {
    // Set mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    await page.locator('[data-testid="preset-doc-medical"]').click();
    const jargonHighlight = page.locator('[data-testid="jargon-term-Itemized Bill"]').or(page.locator('.jargon-highlight')).first();
    await jargonHighlight.click();

    const popover = page.locator('[data-testid="jargon-popover"]');
    await expect(popover).toBeVisible();

    const boundingBox = await popover.boundingBox();
    expect(boundingBox).not.toBeNull();
    if (boundingBox) {
      expect(boundingBox.x).toBeGreaterThanOrEqual(0);
      expect(boundingBox.x + boundingBox.width).toBeLessThanOrEqual(375);
    }
  });

  test('multiple instances of the same jargon term are highlighted individually', async ({ page }) => {
    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: { 
            whatIsHappening: "You need to ask for an Itemized Bill. Note: an Itemized Bill is detailed.", 
            doINeedToPanic: "No.", 
            mainThingToDo: "Ask for an Itemized Bill." 
          },
          deadlines: [],
          jargon: [
            { term: "Itemized Bill", simpleDefinition: "Detailed cost list." }
          ],
          checklist: [], emergencyResources: []
        }),
      });
    });

    await page.locator('[data-testid="preset-doc-medical"]').click();
    const highlights = page.locator('[data-testid="jargon-term-Itemized Bill"]').or(page.locator('.jargon-highlight'));
    // Should have multiple highlight nodes
    await expect(highlights).toHaveCount(3);
  });

  test('extremely long definition text wraps cleanly in popovers', async ({ page }) => {
    const hugeDefinition = "Detail. ".repeat(120);
    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: { whatIsHappening: "We received an Itemized Bill.", doINeedToPanic: "No.", mainThingToDo: "None." },
          deadlines: [],
          jargon: [
            { term: "Itemized Bill", simpleDefinition: hugeDefinition }
          ],
          checklist: [], emergencyResources: []
        }),
      });
    });

    await page.locator('[data-testid="preset-doc-medical"]').click();
    const term = page.locator('[data-testid="jargon-term-Itemized Bill"]').or(page.locator('.jargon-highlight')).first();
    await term.click();

    const popover = page.locator('[data-testid="jargon-popover"]');
    await expect(popover).toBeVisible();

    const hasHorizontalOverflow = await popover.evaluate(el => el.scrollWidth > el.clientWidth + 5);
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('pressing ESC key closes the open jargon popover', async ({ page }) => {
    await page.locator('[data-testid="preset-doc-medical"]').click();
    const term = page.locator('[data-testid="jargon-term-Itemized Bill"]').or(page.locator('.jargon-highlight')).first();
    await term.click();

    const popover = page.locator('[data-testid="jargon-popover"]');
    await expect(popover).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(popover).not.toBeVisible();
  });
});
