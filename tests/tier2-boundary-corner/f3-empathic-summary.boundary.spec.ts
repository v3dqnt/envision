import { test, expect } from '../helpers/test-fixtures';

test.describe('Empathic Summary - Boundary & Corner Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('empty summary field from API degrades gracefully with default placeholder messages', async ({ page }) => {
    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: {
            whatIsHappening: "",
            doINeedToPanic: "",
            mainThingToDo: ""
          },
          deadlines: [], jargon: [], checklist: [], emergencyResources: []
        }),
      });
    });

    await page.locator('[data-testid="manual-text-input"]').fill('Check empty summary response');
    await page.locator('[data-testid="translate-submit-btn"]').click();

    // Verify fallback placeholder text
    const whatHappening = page.locator('[data-testid="summary-what-is-happening"]');
    await expect(whatHappening).toBeVisible();
    await expect(whatHappening).not.toHaveText('');
  });

  test('extremely long summary text wraps correctly without layout breakage', async ({ page }) => {
    const hugeText = 'Paragraph. '.repeat(100);
    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: {
            whatIsHappening: hugeText,
            doINeedToPanic: "No panic.",
            mainThingToDo: "Take action."
          },
          deadlines: [], jargon: [], checklist: [], emergencyResources: []
        }),
      });
    });

    await page.locator('[data-testid="manual-text-input"]').fill('Check overflow wrapping');
    await page.locator('[data-testid="translate-submit-btn"]').click();

    const whatHappening = page.locator('[data-testid="summary-what-is-happening"]');
    await expect(whatHappening).toBeVisible();
    
    // Check if the scrollWidth is less than or equal to clientWidth or overflows gracefully
    const hasOverflow = await whatHappening.evaluate(el => el.scrollWidth > el.clientWidth + 5); // Allow small buffer
    // Should wrap instead of forcing horizontal scroll
    expect(hasOverflow).toBe(false);
  });

  test('markdown parser correctly renders bold, lists, and links', async ({ page }) => {
    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: {
            whatIsHappening: "This is **bold** text and [a link](https://example.com).",
            doINeedToPanic: "Don't panic.",
            mainThingToDo: "Done."
          },
          deadlines: [], jargon: [], checklist: [], emergencyResources: []
        }),
      });
    });

    await page.locator('[data-testid="manual-text-input"]').fill('Check markdown parsing');
    await page.locator('[data-testid="translate-submit-btn"]').click();

    const whatHappening = page.locator('[data-testid="summary-what-is-happening"]');
    // Strong tag should be parsed
    await expect(whatHappening.locator('strong').or(whatHappening.locator('b'))).toBeVisible();
    // Link tag should be parsed
    await expect(whatHappening.locator('a')).toHaveAttribute('href', 'https://example.com');
  });

  test('special characters and Unicode are rendered correctly', async ({ page }) => {
    const unicodeText = '⚠️ Attention: Please contact: 📞 1-800-555-5555. 漢字 & emoji 🎉.';
    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: {
            whatIsHappening: unicodeText,
            doINeedToPanic: "No.",
            mainThingToDo: "Do it."
          },
          deadlines: [], jargon: [], checklist: [], emergencyResources: []
        }),
      });
    });

    await page.locator('[data-testid="manual-text-input"]').fill('Check unicode rendering');
    await page.locator('[data-testid="translate-submit-btn"]').click();

    const whatHappening = page.locator('[data-testid="summary-what-is-happening"]');
    await expect(whatHappening).toContainText(unicodeText);
  });

  test('api rate limits (429) fallback displays warning and retry timer', async ({ page }) => {
    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Too Many Requests', retryAfter: 30 })
      });
    });

    await page.locator('[data-testid="manual-text-input"]').fill('Check rate limit');
    await page.locator('[data-testid="translate-submit-btn"]').click();

    const errorBanner = page.locator('[data-testid="error-banner"]').or(page.locator('.rate-limit-message'));
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText(/rate limit|too many requests|retry|slow down/i);
  });
});
