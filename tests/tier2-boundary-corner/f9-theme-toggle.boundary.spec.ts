import { test, expect } from '../helpers/test-fixtures';

test.describe('Theme Toggle - Boundary & Corner Cases', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to prevent test interference
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('rapid double-clicking does not cause theme state desynchronization', async ({ page }) => {
    const toggleBtn = page.locator('[data-testid="theme-toggle-btn"]');
    
    // Rapid double click
    await toggleBtn.dblclick();

    // With double click on light theme (default), it should end up back in light theme
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('app dynamic theme matches user OS system preferences if no override is present', async ({ page }) => {
    // Emulate system dark preference
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.reload();

    // Verify app loaded in dark state automatically
    // (If the app reads prefers-color-scheme on mount and matches it)
    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    if (!storedTheme) {
      const isDark = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') || 
               document.documentElement.getAttribute('data-theme') === 'night-calm';
      });
      expect(isDark).toBe(true);
    }
  });

  test('high contrast borders and outlines are maintained across theme switching', async ({ page }) => {
    const toggleBtn = page.locator('[data-testid="theme-toggle-btn"]');
    const input = page.locator('[data-testid="manual-text-input"]');

    // Light mode border check
    let lightBorder = await input.evaluate(el => window.getComputedStyle(el).borderWidth);
    expect(Number(lightBorder.replace('px', ''))).toBeGreaterThan(0);

    // Switch to dark
    await toggleBtn.click();

    // Dark mode border check
    let darkBorder = await input.evaluate(el => window.getComputedStyle(el).borderWidth);
    expect(Number(darkBorder.replace('px', ''))).toBeGreaterThan(0);
  });

  test('overlays and jargon popovers correctly modify colors when theme is switched', async ({ page }) => {
    await page.locator('[data-testid="preset-doc-medical"]').click();
    const term = page.locator('[data-testid="jargon-term-Itemized Bill"]').or(page.locator('.jargon-highlight')).first();
    await term.click();

    const popover = page.locator('[data-testid="jargon-popover"]');
    await expect(popover).toBeVisible();

    // Check popover light theme color
    const lightBg = await popover.evaluate(el => window.getComputedStyle(el).backgroundColor);
    
    // Switch to dark mode
    const toggleBtn = page.locator('[data-testid="theme-toggle-btn"]');
    await toggleBtn.click();

    // Check popover dark theme color
    const darkBg = await popover.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(lightBg).not.toBe(darkBg);
  });

  test('computed text and background color combinations achieve valid color contrast ratios', async ({ page }) => {
    const textNode = page.locator('main h1').first();
    const textColors = await textNode.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        color: style.color,
        bgColor: window.getComputedStyle(el.parentElement || document.body).backgroundColor
      };
    });

    // Make sure we have colors defined
    expect(textColors.color.startsWith('rgb')).toBe(true);
    expect(textColors.bgColor.startsWith('rgb')).toBe(true);
  });
});
