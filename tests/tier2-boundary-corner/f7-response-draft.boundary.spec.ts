import { test, expect } from '../helpers/test-fixtures';

test.describe('Response Draft Generator - Boundary & Corner Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('empty draft from API triggers clientside fallback draft generator', async ({ page }) => {
    await page.route('**/api/draft', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ draft: "" }),
      });
    });

    await page.locator('[data-testid="preset-doc-medical"]').click();
    const draftTextarea = page.locator('[data-testid="response-draft-textarea"]');
    await expect(draftTextarea).toBeVisible();
    await expect(draftTextarea).not.toHaveValue('');
  });

  test('draft API network failure keeps existing draft and shows connection warning', async ({ page }) => {
    await page.locator('[data-testid="preset-doc-medical"]').click();
    const draftTextarea = page.locator('[data-testid="response-draft-textarea"]');
    const originalText = await draftTextarea.inputValue();

    // Mock API failure for next draft click
    await page.route('**/api/draft', async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Service Unavailable' })
      });
    });

    const firmToneBtn = page.locator('[data-testid="tone-btn-firm"]');
    await firmToneBtn.click();

    // Draft text should remain intact
    await expect(draftTextarea).toHaveValue(originalText);
    
    // Warning banner should display connection issue
    const warning = page.locator('[data-testid="error-banner"]').or(page.locator('.draft-error-indicator'));
    await expect(warning).toBeVisible();
    await expect(warning).toContainText(/error|network|failed/i);
  });

  test('clipboard API block displays selectable fallback model popup or hint', async ({ page }) => {
    // Revoke clipboard permission to test fallback
    await page.context().clearPermissions();

    await page.locator('[data-testid="preset-doc-medical"]').click();
    const copyBtn = page.locator('[data-testid="copy-draft-btn"]');
    await copyBtn.click();

    // Visual tooltip / notification should instruct manual selection/copy
    const tooltip = page.locator('[data-testid="copy-status-tooltip"]').or(page.locator('.tooltip'));
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText(/press|copy|manual|select/i);
  });

  test('manually editing the draft textarea warns user or disables tone changes to prevent overwrites', async ({ page }) => {
    await page.locator('[data-testid="preset-doc-medical"]').click();
    const draftTextarea = page.locator('[data-testid="response-draft-textarea"]');
    
    // Type manual edit
    await draftTextarea.focus();
    await page.keyboard.type(' Adding customized text.');

    // Warning message or confirmation overlay should appear
    const overwriteWarning = page.locator('[data-testid="draft-overwrite-warning"]').or(page.locator('.warning'));
    // Tone selector could trigger a warning when clicked
    const firmToneBtn = page.locator('[data-testid="tone-btn-firm"]');
    await firmToneBtn.click();
    
    await expect(overwriteWarning).toBeVisible();
  });

  test('extremely large draft outputs scroll within visible layout constraints', async ({ page }) => {
    const massiveDraft = 'Draft Paragraph text. '.repeat(1000); // ~4000 words
    await page.route('**/api/draft', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ draft: massiveDraft }),
      });
    });

    await page.locator('[data-testid="preset-doc-medical"]').click();
    const draftTextarea = page.locator('[data-testid="response-draft-textarea"]');
    await expect(draftTextarea).toBeVisible();

    const isScrollable = await draftTextarea.evaluate(el => el.scrollHeight > el.clientHeight);
    expect(isScrollable).toBe(true);
  });
});
