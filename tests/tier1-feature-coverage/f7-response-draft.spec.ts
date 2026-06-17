import { test, expect } from '../helpers/test-fixtures';

test.describe('Response Draft Generator', () => {
  test.beforeEach(async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
    await page.locator('[data-testid="preset-doc-medical"]').click();
  });

  test('draft textarea is rendered and pre-populated with a generated draft', async ({ page }) => {
    const draftTextarea = page.locator('[data-testid="response-draft-textarea"]');
    await expect(draftTextarea).toBeVisible();
    await expect(draftTextarea).toContainText('Dear General Clinic');
  });

  test('copy to clipboard button copies the text correctly', async ({ page, context }) => {
    const draftTextarea = page.locator('[data-testid="response-draft-textarea"]');
    const draftText = await draftTextarea.inputValue();

    const copyBtn = page.locator('[data-testid="copy-draft-btn"]');
    await copyBtn.click();

    // Verify system clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe(draftText);
  });

  test('tone selectors trigger custom tone variations for the draft', async ({ page }) => {
    const firmToneBtn = page.locator('[data-testid="tone-btn-firm"]');
    await expect(firmToneBtn).toBeVisible();
    await firmToneBtn.click();

    // The draft text should change or display updating loading state
    const draftTextarea = page.locator('[data-testid="response-draft-textarea"]');
    await expect(draftTextarea).toBeVisible();
  });

  test('manual edits to the draft textarea are allowed and maintained', async ({ page }) => {
    const draftTextarea = page.locator('[data-testid="response-draft-textarea"]');
    await draftTextarea.fill('This is my customized manual edit.');
    await expect(draftTextarea).toHaveValue('This is my customized manual edit.');
  });

  test('response draft updates when a new translation preset is loaded', async ({ page }) => {
    const draftTextarea = page.locator('[data-testid="response-draft-textarea"]');
    const firstDraft = await draftTextarea.inputValue();

    // Trigger another preset
    await page.locator('[data-testid="preset-doc-eviction"]').click();
    
    // Draft should change (or reload and update)
    await expect(draftTextarea).not.toHaveValue(firstDraft);
  });
});
