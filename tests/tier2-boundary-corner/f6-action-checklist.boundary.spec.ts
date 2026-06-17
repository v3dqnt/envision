import { test, expect } from '../helpers/test-fixtures';

test.describe('Action Checklist - Boundary & Corner Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('empty checklist array displays general placeholder tasks', async ({ page }) => {
    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: { whatIsHappening: "Ok", doINeedToPanic: "No", mainThingToDo: "None" },
          deadlines: [], jargon: [], checklist: [], emergencyResources: []
        }),
      });
    });

    await page.locator('[data-testid="preset-doc-medical"]').click();
    const fallbackText = page.locator('[data-testid="no-checklist-message"]').or(page.locator('.no-checklist'));
    await expect(fallbackText).toBeVisible();
    await expect(fallbackText).toContainText(/no actions|checklist/i);
  });

  test('completing all checklist items displays congratulatory visual state', async ({ page }) => {
    await page.locator('[data-testid="preset-doc-medical"]').click();
    const checkboxes = page.locator('[data-testid="checklist-item-checkbox"]');
    const count = await checkboxes.count();
    
    for (let i = 0; i < count; i++) {
      await checkboxes.nth(i).check();
    }

    const successMessage = page.locator('[data-testid="checklist-completion-success"]').or(page.locator('.completed-state'));
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText(/all done|complete|success/i);
  });

  test('large checklists with 10+ items fit within container using vertical scrolling', async ({ page }) => {
    const manySteps = Array.from({ length: 15 }, (_, i) => ({
      id: `step-${i}`,
      step: `This is step number ${i + 1} to handle this issue.`,
      rationale: `Rationale details for step number ${i + 1}`
    }));

    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: { whatIsHappening: "Ok", doINeedToPanic: "No", mainThingToDo: "None" },
          deadlines: [], jargon: [], 
          checklist: manySteps,
          emergencyResources: []
        }),
      });
    });

    await page.locator('[data-testid="preset-doc-medical"]').click();

    const checklistContainer = page.locator('[data-testid="checklist-scroll-container"]').or(page.locator('[data-testid="action-checklist"]'));
    await expect(checklistContainer).toBeVisible();
    
    const isScrollable = await checklistContainer.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.overflowY === 'auto' || style.overflowY === 'scroll' || el.scrollHeight > el.clientHeight;
    });
    expect(isScrollable).toBe(true);
  });

  test('extremely long item texts wrap without horizontal scrolling', async ({ page }) => {
    const longText = 'Action item requirement text. '.repeat(100);
    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: { whatIsHappening: "Ok", doINeedToPanic: "No", mainThingToDo: "None" },
          deadlines: [], jargon: [], 
          checklist: [{ id: 'step-1', step: longText, rationale: 'none' }],
          emergencyResources: []
        }),
      });
    });

    await page.locator('[data-testid="preset-doc-medical"]').click();
    const firstStepText = page.locator('[data-testid="checklist-item-text"]').first();
    const hasHorizontalOverflow = await firstStepText.evaluate(el => el.scrollWidth > el.clientWidth + 5);
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('switching preset documents resets progress meter and unchecked states', async ({ page }) => {
    await page.locator('[data-testid="preset-doc-medical"]').click();
    const checkbox = page.locator('[data-testid="checklist-item-checkbox"]').first();
    await checkbox.check();

    const meter = page.locator('[data-testid="progress-meter"]');
    let progress = await meter.getAttribute('data-progress');
    expect(Number(progress)).toBeGreaterThan(0);

    // Switch presets
    await page.locator('[data-testid="preset-doc-eviction"]').click();
    
    // Checkboxes should reset to unchecked
    const newCheckbox = page.locator('[data-testid="checklist-item-checkbox"]').first();
    await expect(newCheckbox).not.toBeChecked();

    const resetProgress = await meter.getAttribute('data-progress');
    expect(Number(resetProgress || '0')).toBe(0);
  });
});
