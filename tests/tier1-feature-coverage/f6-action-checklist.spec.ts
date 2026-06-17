import { test, expect } from '../helpers/test-fixtures';

test.describe('Action Checklist', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="preset-doc-medical"]').click();
  });

  test('checklist shows all translated steps from response', async ({ page }) => {
    const list = page.locator('[data-testid="action-checklist"]');
    await expect(list).toBeVisible();
    
    const items = page.locator('[data-testid="checklist-item"]');
    await expect(items).toHaveCount(2);
  });

  test('checking boxes completes steps and marks them as completed', async ({ page }) => {
    const checkbox = page.locator('[data-testid="checklist-item-checkbox"]').first();
    await expect(checkbox).not.toBeChecked();
    
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  });

  test('updating progress circular meter matches completion percentage', async ({ page }) => {
    const meter = page.locator('[data-testid="progress-meter"]');
    await expect(meter).toBeVisible();

    // Initially 0% or low value
    const initialProgress = await meter.getAttribute('data-progress');
    
    // Check one item
    const checkbox1 = page.locator('[data-testid="checklist-item-checkbox"]').nth(0);
    await checkbox1.check();
    
    const intermediateProgress = await meter.getAttribute('data-progress');
    expect(Number(intermediateProgress)).toBeGreaterThan(Number(initialProgress || '0'));

    // Check all items
    const checkbox2 = page.locator('[data-testid="checklist-item-checkbox"]').nth(1);
    await checkbox2.check();

    const finalProgress = await meter.getAttribute('data-progress');
    expect(Number(finalProgress)).toBe(100);
  });

  test('clicking step expansion shows detailed rationale and explanation', async ({ page }) => {
    const rationaleToggle = page.locator('[data-testid="checklist-item-rationale-toggle"]').first();
    await rationaleToggle.click();

    const details = page.locator('[data-testid="checklist-item-details"]').first();
    await expect(details).toBeVisible();
    await expect(details).toContainText('Clinics often double-bill');
  });

  test('unchecking boxes decrements the progress meter', async ({ page }) => {
    const meter = page.locator('[data-testid="progress-meter"]');
    const checkbox = page.locator('[data-testid="checklist-item-checkbox"]').first();
    
    await checkbox.check();
    let currentProgress = await meter.getAttribute('data-progress');
    expect(Number(currentProgress)).toBeGreaterThan(0);

    await checkbox.uncheck();
    let finalProgress = await meter.getAttribute('data-progress');
    expect(Number(finalProgress)).toBe(0);
  });
});
