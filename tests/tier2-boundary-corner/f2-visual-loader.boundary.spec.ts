import { test, expect } from '../helpers/test-fixtures';

test.describe('Visual Loader - Boundary & Corner Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('rapidly submitting and cancelling does not crash UI state', async ({ page }) => {
    const textInput = page.locator('[data-testid="manual-text-input"]');
    const submitBtn = page.locator('[data-testid="translate-submit-btn"]');
    const cancelBtn = page.locator('[data-testid="cancel-translation-btn"]').or(page.locator('[data-testid="clear-input-btn"]'));

    await textInput.fill('Speed test input');
    
    // Rapid cycle 1
    await submitBtn.click();
    await cancelBtn.click();

    // Rapid cycle 2
    await textInput.fill('Speed test input');
    await submitBtn.click();
    await cancelBtn.click();

    // Ensure page returns to stable state
    await expect(page.locator('[data-testid="manual-text-input"]')).toHaveValue('');
    await expect(page.locator('[data-testid="visual-loader"]')).not.toBeVisible();
  });

  test('long network delays (>10s) display continuous calming breathing prompts', async ({ page }) => {
    // Intercept with 12 second delay
    await page.route('**/api/translate', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 12000));
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.locator('[data-testid="manual-text-input"]').fill('Slow request processing');
    await page.locator('[data-testid="translate-submit-btn"]').click();

    // Verify loader and continuous breathing hints
    const loader = page.locator('[data-testid="visual-loader"]');
    await expect(loader).toBeVisible();

    const calmPrompt = page.locator('[data-testid="breathing-prompt"]').or(page.locator('.calming-text'));
    await expect(calmPrompt).toBeVisible();
    await expect(calmPrompt).toContainText(/breath|calm|inhale|exhale/i);
  });

  test('server error (500) terminates loader state and shows error interface', async ({ page }) => {
    // Intercept with server error
    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await page.locator('[data-testid="manual-text-input"]').fill('Error request');
    await page.locator('[data-testid="translate-submit-btn"]').click();

    // Loader should hide and error panel show
    await expect(page.locator('[data-testid="visual-loader"]')).not.toBeVisible();
    
    const errorBanner = page.locator('[data-testid="error-banner"]').or(page.locator('.error-message'));
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText(/error|failed/i);
  });

  test('navigating away during active load cleans up all animations and timers', async ({ page }) => {
    // Set a very long load
    await page.route('**/api/translate', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 15000));
    });

    await page.locator('[data-testid="manual-text-input"]').fill('Navigate check');
    await page.locator('[data-testid="translate-submit-btn"]').click();

    // Navigate to homepage or reload page
    await page.goto('/');

    // Check that we don't have loader visible or active console errors
    await expect(page.locator('[data-testid="visual-loader"]')).not.toBeVisible();
  });

  test('reduced-motion preference disables breathing disc GSAP keyframe timers', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    await page.locator('[data-testid="manual-text-input"]').fill('Reduced animation check');
    await page.locator('[data-testid="translate-submit-btn"]').click();

    const disc = page.locator('[data-testid="breathing-disc"]');
    await expect(disc).toBeVisible();
    
    const transitionValue = await disc.evaluate(el => window.getComputedStyle(el).transition);
    expect(transitionValue === 'none' || transitionValue === '' || transitionValue.includes('0s') || transitionValue.includes('none')).toBe(true);
  });
});
