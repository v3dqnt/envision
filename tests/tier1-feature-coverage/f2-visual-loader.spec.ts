import { test, expect } from '../helpers/test-fixtures';

test.describe('Visual Loader', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('GSAP scanning animation should be present during loading', async ({ page }) => {
    // Trigger loader by submitting text
    await page.locator('[data-testid="manual-text-input"]').fill('Some document text');
    await page.locator('[data-testid="translate-submit-btn"]').click();

    const scanner = page.locator('[data-testid="scanner-line"]');
    await expect(scanner).toBeVisible();
  });

  test('breathing sage disc should pulse during loading', async ({ page }) => {
    await page.locator('[data-testid="manual-text-input"]').fill('Some document text');
    await page.locator('[data-testid="translate-submit-btn"]').click();

    const disc = page.locator('[data-testid="breathing-disc"]');
    await expect(disc).toBeVisible();
    await expect(disc).toHaveClass(/pulse|breath|animate/);
  });

  test('loading complete transition hides loader and shows results', async ({ page }) => {
    await page.locator('[data-testid="manual-text-input"]').fill('Some document text');
    await page.locator('[data-testid="translate-submit-btn"]').click();

    // Loader is visible
    await expect(page.locator('[data-testid="visual-loader"]')).toBeVisible();

    // Eventually loader should disappear and results appear
    await expect(page.locator('[data-testid="visual-loader"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="empathic-summary-panel"]')).toBeVisible();
  });

  test('checklist items should fade-in sequentially', async ({ page }) => {
    await page.locator('[data-testid="manual-text-input"]').fill('Some document text');
    await page.locator('[data-testid="translate-submit-btn"]').click();

    // Wait for results
    await expect(page.locator('[data-testid="action-checklist"]')).toBeVisible();
    const items = page.locator('[data-testid="checklist-item"]');
    
    // Check that at least the first item is visible and has opacity style transition or state
    await expect(items.first()).toBeVisible();
    await expect(items.first()).toHaveCSS('opacity', '1');
  });

  test('prefers-reduced-motion media query disables loading animations', async ({ page }) => {
    // Set prefers-reduced-motion before navigation
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    await page.locator('[data-testid="manual-text-input"]').fill('Some document text');
    await page.locator('[data-testid="translate-submit-btn"]').click();

    // The breathing disc should have reduced animation classes or static styling
    const disc = page.locator('[data-testid="breathing-disc"]');
    await expect(disc).toBeVisible();
    // Check if the animation is disabled (e.g. no infinite pulse class or style animation-name: none)
    const style = await disc.evaluate((el) => window.getComputedStyle(el).animationName);
    expect(style === 'none' || style === '' || style.includes('none')).toBe(true);
  });
});
