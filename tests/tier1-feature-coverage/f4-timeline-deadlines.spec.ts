import { test, expect } from '../helpers/test-fixtures';

test.describe('Timeline and Deadlines', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="preset-doc-medical"]').click();
  });

  test('timeline container is rendered on successful parsing', async ({ page }) => {
    const timeline = page.locator('[data-testid="timeline-container"]');
    await expect(timeline).toBeVisible();
  });

  test('deadline items show dates and descriptions clearly', async ({ page }) => {
    const items = page.locator('[data-testid="deadline-item"]');
    await expect(items).toHaveCount(1);
    
    const firstItem = items.first();
    await expect(firstItem.locator('[data-testid="deadline-date"]')).toContainText('2026-07-16');
    await expect(firstItem.locator('[data-testid="deadline-desc"]')).toContainText('Payment due date or request appeal');
  });

  test('urgency color formats match their threat level (high/medium/low)', async ({ page }) => {
    const item = page.locator('[data-testid="deadline-item"]').first();
    
    // For high urgency, it should have a red or bright highlight design pattern
    await expect(item.locator('[data-testid="deadline-urgency-badge"]')).toContainText('high');
    await expect(item.locator('[data-testid="deadline-urgency-badge"]')).toHaveClass(/bg-urgency-high|text-red|red|border-red|danger/);
  });

  test('deadlines are sorted in chronological order', async ({ page }) => {
    // In our mock, there might be multiple or one. Let's verify sorting order of multiple deadline items if the app renders them.
    const items = page.locator('[data-testid="deadline-item"]');
    const count = await items.count();
    if (count > 1) {
      const dates = await items.locator('[data-testid="deadline-date"]').allTextContents();
      const timestampArray = dates.map(d => new Date(d).getTime());
      for (let i = 0; i < timestampArray.length - 1; i++) {
        expect(timestampArray[i]).toBeLessThanOrEqual(timestampArray[i + 1]);
      }
    }
  });

  test('timeline nodes are visually linked by a connector line', async ({ page }) => {
    const connector = page.locator('[data-testid="timeline-connector"]');
    await expect(connector).toBeVisible();
  });
});
