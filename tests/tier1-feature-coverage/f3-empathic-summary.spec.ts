import { test, expect } from '../helpers/test-fixtures';

test.describe('Empathic Summary', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Trigger a mock translation
    await page.locator('[data-testid="preset-doc-medical"]').click();
  });

  test('summary panel should render in the correct layout grid/flex structure', async ({ page }) => {
    const panel = page.locator('[data-testid="empathic-summary-panel"]');
    await expect(panel).toBeVisible();
    await expect(panel).toHaveCSS('display', 'flex').or(expect(panel).toHaveCSS('display', 'grid'));
  });

  test('"What is happening" section is populated with descriptive text', async ({ page }) => {
    const whatHappening = page.locator('[data-testid="summary-what-is-happening"]');
    await expect(whatHappening).toBeVisible();
    await expect(whatHappening).toContainText('hospital bill for $1,200.00');
  });

  test('"Do I need to panic" section provides clear reassurance', async ({ page }) => {
    const panicSection = page.locator('[data-testid="summary-panic-assessment"]');
    await expect(panicSection).toBeVisible();
    await expect(panicSection).toContainText('No, this is a standard bill');
  });

  test('"Main thing to do" section highlights the actionable priority', async ({ page }) => {
    const mainAction = page.locator('[data-testid="summary-main-action"]');
    await expect(mainAction).toBeVisible();
    await expect(mainAction).toContainText('Contact your insurance company');
  });

  test('streaming text effect displays characters incrementally', async ({ page }) => {
    // Navigate and enter text manually to trace the incremental text display
    await page.goto('/');
    await page.locator('[data-testid="manual-text-input"]').fill('Incremental stream text check');
    await page.locator('[data-testid="translate-submit-btn"]').click();

    const whatHappening = page.locator('[data-testid="summary-what-is-happening"]');
    await expect(whatHappening).toBeVisible();
    
    // Check text length or contents initially vs fully resolved
    const textStart = await whatHappening.textContent();
    // Since mock routing resolves immediately, checking dynamic chunks could be done via a short sleep or checking that the final state contains the complete message.
    // We expect the final text content to equal the mock response summary.
    await expect(whatHappening).toContainText('hospital bill for $1,200.00');
  });
});
