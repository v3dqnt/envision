import { test, expect } from '../helpers/test-fixtures';

test.describe('Emergency Resources', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="preset-doc-medical"]').click();
  });

  test('resource directory cards are rendered on the page', async ({ page }) => {
    const cards = page.locator('[data-testid="resource-card"]');
    await expect(cards.first()).toBeVisible();
  });

  test('resource cards contain title, contact details, and descriptions', async ({ page }) => {
    const card = page.locator('[data-testid="resource-card"]').first();
    await expect(card.locator('[data-testid="resource-name"]')).toContainText('Patient Advocate Foundation');
    await expect(card.locator('[data-testid="resource-contact"]')).toBeVisible();
    await expect(card.locator('[data-testid="resource-description"]')).toBeVisible();
  });

  test('clicking resource contacts triggers appropriate tel: or mailto: schemas', async ({ page }) => {
    const contactLink = page.locator('[data-testid="resource-card"] [data-testid="resource-contact-link"]').first();
    const href = await contactLink.getAttribute('href');
    expect(href?.startsWith('tel:') || href?.startsWith('mailto:')).toBe(true);
  });

  test('resources displayed match the parsed category of the document', async ({ page }) => {
    // Medical bill triggers medical advocates
    const resourceName = page.locator('[data-testid="resource-name"]').first();
    await expect(resourceName).toContainText('Patient Advocate');

    // Trigger tenant/eviction warning
    await page.locator('[data-testid="preset-doc-eviction"]').click();
    const newResourceName = page.locator('[data-testid="resource-name"]').first();
    await expect(newResourceName).not.toContainText('Patient Advocate');
    await expect(newResourceName.or(page.locator('[data-testid="resource-category-badge"]'))).toContainText(/tenant|housing|legal/i);
  });

  test('external info links open in a new tab with rel="noopener noreferrer"', async ({ page }) => {
    const externalLink = page.locator('[data-testid="resource-external-link"]').first();
    if (await externalLink.isVisible()) {
      await expect(externalLink).toHaveAttribute('target', '_blank');
      const rel = await externalLink.getAttribute('rel');
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    }
  });
});
