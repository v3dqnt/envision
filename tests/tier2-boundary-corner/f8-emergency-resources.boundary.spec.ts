import { test, expect } from '../helpers/test-fixtures';

test.describe('Emergency Resources - Boundary & Corner Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('empty resources array displays general national crisis hotline resources', async ({ page }) => {
    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: { whatIsHappening: "Ok", doINeedToPanic: "No", mainThingToDo: "None" },
          deadlines: [], jargon: [], checklist: [], 
          emergencyResources: []
        }),
      });
    });

    await page.locator('[data-testid="preset-doc-medical"]').click();
    
    // Shows general fallback emergency resource cards
    const resourceCard = page.locator('[data-testid="resource-card"]').first();
    await expect(resourceCard).toBeVisible();
    await expect(resourceCard.locator('[data-testid="resource-name"]')).toContainText(/national|crisis|legal aid/i);
  });

  test('broken contact schema details omit tel: link and render as text', async ({ page }) => {
    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: { whatIsHappening: "Ok", doINeedToPanic: "No", mainThingToDo: "None" },
          deadlines: [], jargon: [], checklist: [], 
          emergencyResources: [
            { name: "Broken Contact Info", contact: "No Phone Number Available", description: "Advocate" }
          ]
        }),
      });
    });

    await page.locator('[data-testid="preset-doc-medical"]').click();
    
    const card = page.locator('[data-testid="resource-card"]').first();
    await expect(card).toBeVisible();
    
    const link = card.locator('[data-testid="resource-contact-link"]');
    // If not a phone or email, it should not have a clickable tel: link, or should degrade to text
    const href = await link.getAttribute('href');
    expect(href === null || href === '' || (!href.startsWith('tel:') && !href.startsWith('mailto:'))).toBe(true);
  });

  test('resource elements load without rendering visual jump or flicker', async ({ page }) => {
    // Artificial latency for API call
    await page.route('**/api/translate', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: { whatIsHappening: "Ok", doINeedToPanic: "No", mainThingToDo: "None" },
          deadlines: [], jargon: [], checklist: [], 
          emergencyResources: [{ name: "Stable Org", contact: "123", description: "Desc" }]
        }),
      });
    });

    await page.locator('[data-testid="preset-doc-medical"]').click();

    // Verify visual loader container maintains static height/layout bounds to prevent content shifting
    const loadingState = page.locator('[data-testid="visual-loader"]');
    await expect(loadingState).toBeVisible();

    const loaderHeight = await loadingState.evaluate(el => el.clientHeight);
    expect(loaderHeight).toBeGreaterThan(50);
  });

  test('directory scrollable container works on extremely narrow viewports (320px)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.locator('[data-testid="preset-doc-medical"]').click();

    const container = page.locator('[data-testid="resources-list-container"]').or(page.locator('[data-testid="resource-card"]').first().locator('xpath=..'));
    await expect(container).toBeVisible();

    const isScrollableOrResponsive = await container.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.overflowX === 'auto' || style.overflowX === 'scroll' || el.scrollWidth <= window.innerWidth || style.display === 'flex';
    });
    expect(isScrollableOrResponsive).toBe(true);
  });

  test('resource cards stack vertically on small screens to retain text readability', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.locator('[data-testid="preset-doc-medical"]').click();

    const cards = page.locator('[data-testid="resource-card"]');
    const count = await cards.count();
    
    if (count > 1) {
      const box1 = await cards.nth(0).boundingBox();
      const box2 = await cards.nth(1).boundingBox();
      expect(box1).not.toBeNull();
      expect(box2).not.toBeNull();
      if (box1 && box2) {
        // Should stack vertically (box2 below box1)
        expect(box2.y).toBeGreaterThanOrEqual(box1.y + box1.height);
      }
    }
  });
});
