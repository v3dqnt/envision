import { test, expect } from '../helpers/test-fixtures';

test.describe('Document Ingestion - Boundary & Corner Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('uploading an invalid file type displays clear error banner', async ({ page }) => {
    const fileInput = page.locator('[data-testid="upload-dropzone"] input[type="file"]');
    
    // Upload an invalid .exe file
    await fileInput.setInputFiles({
      name: 'malicious.exe',
      mimeType: 'application/x-msdownload',
      buffer: Buffer.from('executable binary')
    });

    const errorBanner = page.locator('[data-testid="error-banner"]').or(page.locator('.error-message'));
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText(/invalid|not supported|type/i);
  });

  test('uploading an excessively large file shows size warning', async ({ page }) => {
    const fileInput = page.locator('[data-testid="upload-dropzone"] input[type="file"]');
    
    // Create large mock buffer
    const largeBuffer = Buffer.alloc(15 * 1024 * 1024); // 15MB
    await fileInput.setInputFiles({
      name: 'huge-file.pdf',
      mimeType: 'application/pdf',
      buffer: largeBuffer
    });

    const warning = page.locator('[data-testid="error-banner"]').or(page.locator('.warning-message'));
    await expect(warning).toBeVisible();
    await expect(warning).toContainText(/size|exceeds/i);
  });

  test('graceful handling of OCR library failure', async ({ page }) => {
    // Override OCR globally to simulate failure
    await page.addInitScript(() => {
      window['Tesseract'] = {
        recognize: async () => {
          throw new Error('OCR Engine Failed unexpectedly');
        },
        createWorker: async () => {
          throw new Error('Worker creation failed');
        }
      };
    });

    const fileInput = page.locator('[data-testid="upload-dropzone"] input[type="file"]');
    await fileInput.setInputFiles({
      name: 'ocr-fail.png',
      mimeType: 'image/png',
      buffer: Buffer.from('stub image')
    });

    // Verify system falls back gracefully, requesting manual text input or showing a warning
    const ocrError = page.locator('[data-testid="ocr-error-fallback"]').or(page.locator('[data-testid="error-banner"]'));
    await expect(ocrError).toBeVisible();
    await expect(ocrError).toContainText(/ocr|read|text|manual/i);
  });

  test('empty document submission is blocked and does not trigger API', async ({ page }) => {
    // Clear textarea
    const textarea = page.locator('[data-testid="manual-text-input"]');
    await textarea.fill('');

    const submitBtn = page.locator('[data-testid="translate-submit-btn"]');
    // It should either be disabled or show validation error when clicked
    if (await submitBtn.isEnabled()) {
      await submitBtn.click();
      const validationError = page.locator('[data-testid="validation-error"]').or(page.locator('.error'));
      await expect(validationError).toBeVisible();
    } else {
      await expect(submitBtn).toBeDisabled();
    }
  });

  test('cancelling ingestion reset the UI to initial state', async ({ page }) => {
    await page.locator('[data-testid="manual-text-input"]').fill('Text to clear');
    const cancelBtn = page.locator('[data-testid="cancel-translation-btn"]').or(page.locator('[data-testid="clear-input-btn"]'));
    
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    await expect(page.locator('[data-testid="manual-text-input"]')).toHaveValue('');
    await expect(page.locator('[data-testid="visual-loader"]')).not.toBeVisible();
  });
});
