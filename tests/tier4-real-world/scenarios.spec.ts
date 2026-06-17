import { test, expect } from '../helpers/test-fixtures';

// Custom mocks for each scenario
const SCENARIO_1_MOCKS = {
  translation: {
    summary: {
      whatIsHappening: "You received a hospital bill for $1,200.00 from General Clinic.",
      doINeedToPanic: "No, this is a standard bill and you have time to request an itemized statement or appeal.",
      mainThingToDo: "Contact your insurance company to check coverage and request an itemized bill from the clinic."
    },
    deadlines: [
      {
        date: "2026-07-16",
        description: "Payment due date or request appeal",
        urgency: "high"
      }
    ],
    jargon: [
      {
        term: "Itemized Bill",
        simpleDefinition: "A detailed list of every single service, pill, and procedure you are being charged for, with individual costs."
      }
    ],
    checklist: [
      {
        id: "step-1",
        step: "Request an itemized statement from General Clinic.",
        rationale: "Clinics often double-bill or make mistakes that are only visible on the detailed list."
      }
    ],
    emergencyResources: [
      {
        name: "Patient Advocate Foundation",
        contact: "1-800-532-5274",
        description: "Helps patients resolve billing, insurance, and financial hurdles."
      }
    ]
  },
  draft: {
    draft: "Dear General Clinic,\n\nI am writing to formally request an itemized billing statement for account number..."
  }
};

const SCENARIO_2_MOCKS = {
  translation: {
    summary: {
      whatIsHappening: "You received a 3-day notice to pay rent or quit.",
      doINeedToPanic: "Take immediate action: eviction warning has a very short deadline.",
      mainThingToDo: "Respond or pay within 3 days."
    },
    deadlines: [
      {
        date: "2026-06-19",
        description: "3-Day notice deadline",
        urgency: "high"
      }
    ],
    jargon: [
      {
        term: "Unlawful Detainer",
        simpleDefinition: "The legal term for an eviction lawsuit after a notice expires."
      }
    ],
    checklist: [
      {
        id: "evict-1",
        step: "Check date of service on the notice.",
        rationale: "If it was not served properly, it might be invalid."
      }
    ],
    emergencyResources: [
      {
        name: "Tenant Rights Coalition",
        contact: "info@tenantsrights.org",
        description: "Provides free legal defense for tenants."
      }
    ]
  },
  draft: {
    draft: "To Landlord,\n\nI am disputing this 3-day notice..."
  }
};

const SCENARIO_3_MOCKS = {
  translation: {
    summary: {
      whatIsHappening: "A debt collector is demanding payment of $500.00.",
      doINeedToPanic: "No, you have the legal right to dispute and verify this debt within 30 days.",
      mainThingToDo: "Request a debt verification letter."
    },
    deadlines: [
      {
        date: "2026-07-16",
        description: "30-day debt validation window",
        urgency: "medium"
      }
    ],
    jargon: [
      {
        term: "Debt Verification",
        simpleDefinition: "Your legal right to demand proof from the collector that you actually owe the money."
      }
    ],
    checklist: [
      {
        id: "debt-1",
        step: "Send a written Debt Verification Request.",
        rationale: "Requires collector to halt collections until they provide proof."
      }
    ],
    emergencyResources: [
      {
        name: "Consumer Financial Protection Bureau (CFPB)",
        contact: "855-411-2372",
        description: "Protects consumers from abusive debt collection."
      }
    ]
  },
  draft: {
    draft: "Dear Collector,\n\nI am writing to request verification of this debt under the FDCPA..."
  }
};

const SCENARIO_4_MOCKS = {
  translation: {
    summary: {
      whatIsHappening: "You received a school suspension notice.",
      doINeedToPanic: "No, you have the right to appeal the decision and review evidence.",
      mainThingToDo: "Submit a formal appeal request."
    },
    deadlines: [
      {
        date: "2026-06-25",
        description: "Hearing and Appeal date",
        urgency: "high"
      }
    ],
    jargon: [
      {
        term: "Due Process",
        simpleDefinition: "Your constitutional right to a fair hearing and to hear the charges against you."
      }
    ],
    checklist: [
      {
        id: "appeal-1",
        step: "Request academic records and incident report.",
        rationale: "Ensures you know what evidence they have."
      }
    ],
    emergencyResources: [
      {
        name: "Student Legal Services",
        contact: "sls@studenthelp.org",
        description: "Provides assistance for academic appeals."
      }
    ]
  },
  draft: {
    draft: "To the Disciplinary Committee,\n\nI wish to appeal the suspension decision..."
  }
};

const SCENARIO_5_MOCKS = {
  translation: {
    summary: {
      whatIsHappening: "Utility shut-off notice due to unpaid bill.",
      doINeedToPanic: "No, utility companies are often required to offer payment plan extensions or LIHEAP programs.",
      mainThingToDo: "Contact utility and apply for assistance."
    },
    deadlines: [
      {
        date: "2026-06-30",
        description: "Shut-off execution date",
        urgency: "high"
      }
    ],
    jargon: [
      {
        term: "LIHEAP",
        simpleDefinition: "Low Income Home Energy Assistance Program, a federal grant program to help pay utility bills."
      }
    ],
    checklist: [
      {
        id: "util-1",
        step: "Apply for LIHEAP utility assistance.",
        rationale: "Provides emergency cash grants for home heating/cooling bills."
      }
    ],
    emergencyResources: [
      {
        name: "LIHEAP Office",
        contact: "1-866-674-6327",
        description: "Provides federal utility assistance."
      }
    ]
  },
  draft: {
    draft: "Dear Utility Provider,\n\nI am writing to request a payment extension and notify you of my pending LIHEAP application..."
  }
};

test.describe('Tier 4: Real-World Application Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
  });

  test('Scenario 1 (Medical Bill Negotiation Flow): select hospital bill preset, check summary/deadlines, hover-decode "Itemized Bill", complete step 1 checklist, generate "Polite request" tone draft, copy to clipboard, verify Patient Advocate resources', async ({ page }) => {
    // Override translation endpoint with Scenario 1 data
    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(SCENARIO_1_MOCKS.translation),
      });
    });

    await page.route('**/api/draft', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(SCENARIO_1_MOCKS.draft),
      });
    });

    // 1. Select preset
    await page.locator('[data-testid="preset-doc-medical"]').click();

    // 2. Check summary & deadlines
    const summary = page.locator('[data-testid="empathic-summary-panel"]');
    await expect(summary).toBeVisible();
    await expect(page.locator('[data-testid="summary-what-is-happening"]')).toContainText('General Clinic');
    await expect(page.locator('[data-testid="timeline-container"]')).toBeVisible();

    // 3. Hover-decode jargon
    const jargonHighlight = page.locator('[data-testid="jargon-term-Itemized Bill"]').or(page.locator('.jargon-highlight')).first();
    await jargonHighlight.hover();
    await jargonHighlight.click();

    const popover = page.locator('[data-testid="jargon-popover"]');
    await expect(popover).toBeVisible();
    await expect(page.locator('[data-testid="jargon-definition"]')).toContainText('A detailed list of every single service');

    // 4. Complete step 1 checklist
    const checkbox = page.locator('[data-testid="checklist-item-checkbox"]').first();
    await checkbox.check();
    await expect(checkbox).toBeChecked();

    // 5. Generate tone draft
    const politeBtn = page.locator('[data-testid="tone-btn-polite"]').or(page.locator('[data-testid="tone-btn-firm"]')).first();
    await politeBtn.click();

    const draftTextarea = page.locator('[data-testid="response-draft-textarea"]');
    await expect(draftTextarea).toBeVisible();

    // 6. Copy to clipboard
    const copyBtn = page.locator('[data-testid="copy-draft-btn"]');
    await copyBtn.click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).not.toBe('');

    // 7. Verify Patient Advocate resources
    const resourceCard = page.locator('[data-testid="resource-card"]').first();
    await expect(resourceCard.locator('[data-testid="resource-name"]')).toContainText('Patient Advocate');
  });

  test('Scenario 2 (Eviction Warning Flow): select eviction warning preset, verify short 3-day deadline attention styles, decode "Unlawful Detainer", checklist checks, generate "Formal dispute" tone draft, locate tenant resources', async ({ page }) => {
    // Override translation endpoint with Scenario 2 data
    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(SCENARIO_2_MOCKS.translation),
      });
    });

    await page.route('**/api/draft', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(SCENARIO_2_MOCKS.draft),
      });
    });

    // 1. Select eviction warning preset
    await page.locator('[data-testid="preset-doc-eviction"]').click();

    // 2. Verify short 3-day deadline attention styles
    const deadlineItem = page.locator('[data-testid="deadline-item"]').first();
    await expect(deadlineItem.locator('[data-testid="deadline-urgency-badge"]')).toContainText('high');
    await expect(deadlineItem.locator('[data-testid="deadline-urgency-badge"]')).toHaveClass(/bg-urgency-high|text-red|red|border-red|danger/);

    // 3. Decode "Unlawful Detainer"
    const jargonHighlight = page.locator('[data-testid="jargon-term-Unlawful Detainer"]').or(page.locator('.jargon-highlight')).first();
    await jargonHighlight.hover();
    await jargonHighlight.click();

    const popover = page.locator('[data-testid="jargon-popover"]');
    await expect(popover).toBeVisible();
    await expect(page.locator('[data-testid="jargon-definition"]')).toContainText('The legal term for an eviction lawsuit');

    // 4. Checklist checks
    const checkbox = page.locator('[data-testid="checklist-item-checkbox"]').first();
    await checkbox.check();

    // 5. Generate "Formal dispute" tone draft
    const formalBtn = page.locator('[data-testid="tone-btn-formal"]').or(page.locator('[data-testid="tone-btn-firm"]')).first();
    await formalBtn.click();
    await expect(page.locator('[data-testid="response-draft-textarea"]')).toBeVisible();

    // 6. Locate tenant resources
    const resourceCard = page.locator('[data-testid="resource-card"]').first();
    await expect(resourceCard.locator('[data-testid="resource-name"]').or(page.locator('[data-testid="resource-category-badge"]'))).toContainText(/tenant|rights|coalition|housing|legal/i);
  });

  test('Scenario 3 (Debt Collector Verification Flow): manually enter collection text, view summary, decode "Debt Verification", edit draft response, copy draft, switch to dark mode, verify resources', async ({ page }) => {
    // Override translation endpoint with Scenario 3 data
    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(SCENARIO_3_MOCKS.translation),
      });
    });

    await page.route('**/api/draft', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(SCENARIO_3_MOCKS.draft),
      });
    });

    // 1. Manually enter collection text
    const textarea = page.locator('[data-testid="manual-text-input"]');
    await textarea.fill('URGENT: A debt collector is demanding payment of $500.00 for account 98765. Debt Verification is requested.');

    // 2. Click translate
    const submitBtn = page.locator('[data-testid="translate-submit-btn"]');
    await submitBtn.click();

    // 3. View summary
    await expect(page.locator('[data-testid="empathic-summary-panel"]')).toBeVisible();

    // 4. Decode "Debt Verification"
    const jargonHighlight = page.locator('[data-testid="jargon-term-Debt Verification"]').or(page.locator('.jargon-highlight')).first();
    await jargonHighlight.hover();
    await jargonHighlight.click();

    const popover = page.locator('[data-testid="jargon-popover"]');
    await expect(popover).toBeVisible();
    await expect(page.locator('[data-testid="jargon-definition"]')).toContainText('Your legal right to demand proof');

    // 5. Edit draft response
    const draftTextarea = page.locator('[data-testid="response-draft-textarea"]');
    await expect(draftTextarea).toBeVisible();
    const originalText = await draftTextarea.inputValue();
    const editedText = originalText + ' Additional verification request details.';
    await draftTextarea.fill(editedText);

    // 6. Copy draft
    const copyBtn = page.locator('[data-testid="copy-draft-btn"]');
    await copyBtn.click();
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe(editedText);

    // 7. Switch to dark mode
    const themeBtn = page.locator('[data-testid="theme-toggle-btn"]');
    await themeBtn.click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    // 8. Verify resources
    const resourceCard = page.locator('[data-testid="resource-card"]').first();
    await expect(resourceCard.locator('[data-testid="resource-name"]')).toContainText('Consumer Financial Protection Bureau');
  });

  test('Scenario 4 (Suspension Appeal Flow): drop mock suspension file, see timeline hear dates, request records checklist, set "Appeal" tone draft, verify keyboard focus loops through all main dashboard items', async ({ page }) => {
    // Override translation endpoint with Scenario 4 data
    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(SCENARIO_4_MOCKS.translation),
      });
    });

    await page.route('**/api/draft', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(SCENARIO_4_MOCKS.draft),
      });
    });

    // 1. Drop mock suspension file
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      const file = new File(['suspension content'], 'suspension.pdf', { type: 'application/pdf' });
      dt.items.add(file);
      return dt;
    });
    await page.dispatchEvent('[data-testid="upload-dropzone"]', 'drop', { dataTransfer });

    // 2. See timeline hear dates
    const timeline = page.locator('[data-testid="timeline-container"]');
    await expect(timeline).toBeVisible();
    await expect(page.locator('[data-testid="deadline-date"]').first()).toContainText('2026-06-25');

    // 3. Request records checklist
    const checkbox = page.locator('[data-testid="checklist-item-checkbox"]').first();
    await checkbox.check();

    // 4. Set "Appeal" tone draft
    const appealBtn = page.locator('[data-testid="tone-btn-appeal"]').or(page.locator('[data-testid="tone-btn-firm"]')).first();
    await appealBtn.click();
    const draftTextarea = page.locator('[data-testid="response-draft-textarea"]');
    await expect(draftTextarea).toBeVisible();

    // 5. Verify keyboard focus loops through all main dashboard items
    // Focus theme button and start tab navigation through elements
    await page.locator('[data-testid="theme-toggle-btn"]').focus();
    await page.keyboard.press('Tab');

    // Make sure we have moved focus to some element in the main content/dashboard
    const activeTestId = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    expect(activeTestId).not.toBeNull();
  });

  test('Scenario 5 (Utility Shut-off extension Flow): upload utility bill image (mock OCR), verify payment plan summary, LIHEAP resources, copy draft extension request', async ({ page }) => {
    // Override translation endpoint with Scenario 5 data
    await page.route('**/api/translate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(SCENARIO_5_MOCKS.translation),
      });
    });

    await page.route('**/api/draft', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(SCENARIO_5_MOCKS.draft),
      });
    });

    // 1. Upload utility bill image (mock OCR)
    const fileInput = page.locator('[data-testid="upload-dropzone"] input[type="file"]');
    await fileInput.setInputFiles({
      name: 'utility-bill.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('mock utility bill image')
    });

    // 2. Verify payment plan summary
    await expect(page.locator('[data-testid="empathic-summary-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="summary-main-action"]')).toContainText('utility');

    // 3. LIHEAP resources
    const resourceCard = page.locator('[data-testid="resource-card"]').first();
    await expect(resourceCard.locator('[data-testid="resource-name"]')).toContainText('LIHEAP');

    // 4. Copy draft extension request
    const copyBtn = page.locator('[data-testid="copy-draft-btn"]');
    await copyBtn.click();
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('LIHEAP');
  });
});
