import { test, expect } from '../helpers/test-fixtures';

test.describe('Document Ingestion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('drag-and-drop should trigger document upload state', async ({ page }) => {
    const dropzone = page.locator('[data-testid="upload-dropzone"]');
    await expect(dropzone).toBeVisible();

    // Simulate drag and drop events
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      const file = new File(['mock content'], 'bill.pdf', { type: 'application/pdf' });
      dt.items.add(file);
      return dt;
    });

    await page.dispatchEvent('[data-testid="upload-dropzone"]', 'drop', { dataTransfer });
    
    // Assert visual loader or file uploaded state is shown
    await expect(page.locator('[data-testid="upload-success-state"]').or(page.locator('[data-testid="visual-loader"]'))).toBeVisible();
  });

  test('manual text area should allow typing and submission', async ({ page }) => {
    const textarea = page.locator('[data-testid="manual-text-input"]');
    await expect(textarea).toBeVisible();
    await textarea.fill('URGENT NOTICE: Pay $1200 by tomorrow or face penalties.');
    
    const submitBtn = page.locator('[data-testid="translate-submit-btn"]');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Verify it navigates to or shows the empathic summary panel
    await expect(page.locator('[data-testid="empathic-summary-panel"]')).toBeVisible();
  });

  test('presets library trigger should load predefined documents', async ({ page }) => {
    const presetEviction = page.locator('[data-testid="preset-doc-eviction"]');
    await expect(presetEviction).toBeVisible();
    await presetEviction.click();

    // Verify textarea is populated or translation triggers immediately
    const textarea = page.locator('[data-testid="manual-text-input"]');
    await expect(textarea).not.toHaveValue('');
  });

  test('file input should accept files and update file display', async ({ page }) => {
    const fileInput = page.locator('[data-testid="upload-dropzone"] input[type="file"]');
    
    // Upload a mock text file
    await fileInput.setInputFiles({
      name: 'medical-bill.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake image data')
    });

    // Check that the UI updates with the file name
    await expect(page.locator('[data-testid="file-name-display"]').or(page.locator('[data-testid="visual-loader"]'))).toBeVisible();
  });

  test('clear buttons should reset input state', async ({ page }) => {
    const textarea = page.locator('[data-testid="manual-text-input"]');
    await textarea.fill('Temporary text input to be cleared');
    
    const clearBtn = page.locator('[data-testid="clear-input-btn"]');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();

    await expect(textarea).toHaveValue('');
  });
});
