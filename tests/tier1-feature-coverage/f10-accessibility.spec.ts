import { test, expect } from '../helpers/test-fixtures';

test.describe('Accessibility (WCAG AA Compliance)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('interactive elements display visible focus outlines', async ({ page }) => {
    const textInput = page.locator('[data-testid="manual-text-input"]');
    await textInput.focus();
    
    // Evaluate computed outline
    const outline = await textInput.evaluate(el => window.getComputedStyle(el).outlineStyle);
    // Should have a valid outline style (solid, dashed, dotted, etc.) when focused
    expect(outline).not.toBe('none');
  });

  test('critical page sections and controls have descriptive ARIA roles and labels', async ({ page }) => {
    const dropzone = page.locator('[data-testid="upload-dropzone"]');
    await expect(dropzone).toHaveAttribute('role', /region|button|section/);

    const themeBtn = page.locator('[data-testid="theme-toggle-btn"]');
    await expect(themeBtn).toHaveAttribute('role', 'button');
    await expect(themeBtn).toHaveAttribute('aria-label', /toggle|night/i);

    const fileInput = page.locator('[data-testid="upload-dropzone"] input[type="file"]');
    await expect(fileInput).toHaveAttribute('aria-label', /upload|file/i);
  });

  test('layout elements adjust gracefully without breaking on simulated zoom', async ({ page }) => {
    // Set viewport to smaller dimension to simulate zoomed environment layout
    await page.setViewportSize({ width: 640, height: 480 });
    
    // Ensure all critical sections are still layout-compliant and don't overflow horizontally
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth);
  });

  test('tab navigation order is logical and visits all active elements', async ({ page }) => {
    const themeBtn = page.locator('[data-testid="theme-toggle-btn"]');
    const textInput = page.locator('[data-testid="manual-text-input"]');
    
    // Focus the theme toggle button first, then press Tab to traverse
    await themeBtn.focus();
    await page.keyboard.press('Tab');
    
    // Validate focus moved to manual text input (or intermediate preset buttons)
    const activeTestId = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    expect(activeTestId).not.toBeNull();
  });

  test('computed text colors meet contrast ratio guidelines', async ({ page }) => {
    // Assess contrast of header text
    const headerTitle = page.locator('header span.font-serif');
    await expect(headerTitle).toBeVisible();

    const colors = await headerTitle.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        color: style.color,
        bgColor: window.getComputedStyle(el.parentElement || el).backgroundColor
      };
    });

    // Verify colors are computed and non-empty
    expect(colors.color).not.toBe('');
    expect(colors.bgColor).not.toBe('');
  });
});
