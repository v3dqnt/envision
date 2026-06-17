import { test as base } from '@playwright/test';
import { MOCK_TRANSLATION_RESPONSE, MOCK_DRAFT_RESPONSE } from '../mocks/api-responses';

/**
 * Custom E2E test fixture to intercept network calls and inject client-side OCR stub
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // 1. Stub client-side Tesseract.js globally before page loads to bypass CDN dependency
    await page.addInitScript(() => {
      window['Tesseract'] = {
        recognize: async (image, langs, options) => {
          return {
            data: {
              text: "MOCK OCR TEXT CONTENT: Account Number 12345. Hospital Bill total is $1200.00. Payment due by July 16, 2026.",
              confidence: 95
            }
          };
        },
        createWorker: async () => {
          return {
            loadLanguage: async () => {},
            initialize: async () => {},
            recognize: async () => ({
              data: {
                text: "MOCK OCR TEXT CONTENT: Account Number 12345. Hospital Bill total is $1200.00. Payment due by July 16, 2026."
              }
            }),
            terminate: async () => {}
          };
        }
      };
    });

    // 2. Intercept app-router translation API
    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_TRANSLATION_RESPONSE),
      });
    });

    // 3. Intercept app-router draft API
    await page.route('**/api/draft', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_DRAFT_RESPONSE),
      });
    });

    // Pass the configured page to tests
    await use(page);
  },
});

export { expect } from '@playwright/test';
