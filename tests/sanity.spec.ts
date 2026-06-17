import { test, expect } from './helpers/test-fixtures';

test('sanity check - E2E harness compiles and runs', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-testid="empathic-summary-panel"]')).toBeVisible();
});
