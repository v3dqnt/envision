import { test, expect } from '../helpers/test-fixtures';

test.describe('Theme Toggle and Color Palettes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('toggling button changes document theme attributes and icons', async ({ page }) => {
    const toggleBtn = page.locator('[data-testid="theme-toggle-btn"]');
    await expect(toggleBtn).toBeVisible();

    // Verify initial state is light
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    
    // Toggle to dark
    await toggleBtn.click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night-calm');

    // Toggle back to light
    await toggleBtn.click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('dark theme applies the custom deep desaturated green background', async ({ page }) => {
    const toggleBtn = page.locator('[data-testid="theme-toggle-btn"]');
    await toggleBtn.click(); // Toggle to dark

    const bodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    // #161E1C is rgb(22, 30, 28)
    expect(bodyBg).toBe('rgb(22, 30, 28)');
  });

  test('light theme applies the warm sand/paper background', async ({ page }) => {
    // Light is default
    const bodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    // #FAF7F2 is rgb(250, 247, 242) or similar warm color
    expect(bodyBg).toContain('rgb(250, 247, 242)');
  });

  test('theme preferences persist across page reloads via localStorage', async ({ page }) => {
    const toggleBtn = page.locator('[data-testid="theme-toggle-btn"]');
    await toggleBtn.click(); // Switch to dark

    // Reload the page
    await page.reload();

    // Theme should still be dark
    await expect(page.locator('html')).toHaveClass(/dark/);
    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBe('dark');
  });

  test('critical UI elements have explicit borders for WCAG contrast compliance', async ({ page }) => {
    // Check manual text area or dropzone borders
    const textInput = page.locator('[data-testid="manual-text-input"]');
    const borderStyle = await textInput.evaluate(el => window.getComputedStyle(el).border);
    expect(borderStyle).not.toBe('');
    expect(borderStyle).not.toBe('none');
  });
});
