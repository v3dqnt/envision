import { test, expect } from '../helpers/test-fixtures';

test.describe('Timeline and Deadlines - Boundary & Corner Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('empty deadlines list renders clear reassurance that no deadlines were found', async ({ page }) => {
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
    const emptyState = page.locator('[data-testid="no-deadlines-message"]').or(page.locator('.no-deadlines'));
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText(/no deadlines|clear/i);
  });

  test('deadlines in the past are visually marked as expired or missed', async ({ page }) => {
    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: { whatIsHappening: "Ok", doINeedToPanic: "No", mainThingToDo: "None" },
          deadlines: [
            { date: "2020-01-01", description: "Expired payment notice", urgency: "high" }
          ],
          jargon: [], checklist: [], emergencyResources: []
        }),
      });
    });

    await page.locator('[data-testid="preset-doc-medical"]').click();
    const deadlineItem = page.locator('[data-testid="deadline-item"]').first();
    await expect(deadlineItem).toBeVisible();
    await expect(deadlineItem.locator('[data-testid="deadline-status"]').or(deadlineItem)).toContainText(/expired|past|missed|overdue/i);
  });

  test('invalid date formats degrade gracefully without crashing the app', async ({ page }) => {
    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: { whatIsHappening: "Ok", doINeedToPanic: "No", mainThingToDo: "None" },
          deadlines: [
            { date: "N/A or Unknown Date", description: "Broken date notice", urgency: "medium" }
          ],
          jargon: [], checklist: [], emergencyResources: []
        }),
      });
    });

    await page.locator('[data-testid="preset-doc-medical"]').click();
    
    // Page renders successfully
    const deadlineItem = page.locator('[data-testid="deadline-item"]').first();
    await expect(deadlineItem).toBeVisible();
    await expect(deadlineItem.locator('[data-testid="deadline-date"]')).toContainText('Unknown Date');
  });

  test('extremely close deadlines (<24h) trigger immediate high urgency color styling', async ({ page }) => {
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 12);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: { whatIsHappening: "Ok", doINeedToPanic: "No", mainThingToDo: "None" },
          deadlines: [
            { date: tomorrowStr, description: "Action due in hours", urgency: "high" }
          ],
          jargon: [], checklist: [], emergencyResources: []
        }),
      });
    });

    await page.locator('[data-testid="preset-doc-medical"]').click();
    const item = page.locator('[data-testid="deadline-item"]').first();
    await expect(item).toBeVisible();
    await expect(item.locator('[data-testid="deadline-urgency-badge"]')).toHaveClass(/bg-urgency-high|urgent|danger|immediate|text-red/);
  });

  test('duplicate deadline dates sort consistently by details description alphabetically', async ({ page }) => {
    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: { whatIsHappening: "Ok", doINeedToPanic: "No", mainThingToDo: "None" },
          deadlines: [
            { date: "2026-07-16", description: "Z last action", urgency: "medium" },
            { date: "2026-07-16", description: "A first action", urgency: "high" }
          ],
          jargon: [], checklist: [], emergencyResources: []
        }),
      });
    });

    await page.locator('[data-testid="preset-doc-medical"]').click();
    const descriptions = await page.locator('[data-testid="deadline-desc"]').allTextContents();
    
    // "A first action" should be sorted first when dates are duplicate
    expect(descriptions[0]).toBe('A first action');
    expect(descriptions[1]).toBe('Z last action');
  });
});
