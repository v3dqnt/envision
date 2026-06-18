import type { DocumentCategory } from '@/context/DocumentContext';

// Demo scenarios for the landing page. Each loads a real document IMAGE (so the
// OCR + annotation pipeline runs on camera); if the image file isn't present
// yet it falls back to the exact text, so the button always works.
// Drop the matching images in /public/samples/ with these filenames.
export interface Scenario {
  id: string;
  name: string;
  blurb: string;
  docType: string;
  category: DocumentCategory;
  image: string;
  text: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'maria',
    name: 'Maria',
    blurb: 'A food-assistance notice with a deadline buried in jargon.',
    docType: 'Benefits notice',
    category: 'food',
    image: '/samples/maria-snap.png',
    text: `DEPARTMENT OF HUMAN SERVICES — DIVISION OF FAMILY ASSISTANCE
Notice Date: 07/02/2026   Case #: 4471902
RE: SNAP RECERTIFICATION — ACTION REQUIRED
Our records indicate your Supplemental Nutrition Assistance Program certification period ended 06/30/2026. To avoid interruption of benefits, you must complete a recertification interview and submit verification of all earned and unearned income, shelter obligations, and household composition no later than 07/10/2026. Failure to respond by the deadline will result in case closure and termination of benefits. Households meeting criteria may qualify for expedited service. Schedule: 1-800-555-0143 or benefits.state.gov/myaccount
This institution is an equal opportunity provider.`,
  },
  {
    id: 'aisha',
    name: 'Aisha',
    blurb: 'An ER bill with a double charge and a collections threat.',
    docType: 'Hospital bill',
    category: 'medical',
    image: '/samples/aisha-bill.png',
    text: `Metro Health System — Statement of Account
Statement Date: 06/16/2026   Account: ER-88231   Service Date: 05/04/2025
Patient: Aisha N.   Insurance: Not on file
Emergency Dept Visit — Level 3 ............ $1,150.00
Facility Fee ............................. $480.00
Medical Supplies (misc.) ................. $325.00
IV Infusion .............................. $290.00
IV Infusion .............................. $290.00
Lab — Metabolic Panel .................... $210.00
TOTAL DUE: $2,745.00
FINAL NOTICE — payment due within 15 days or your account will be referred to collections.`,
  },
  {
    id: 'david',
    name: 'David',
    blurb: 'Discharge notes with a confusing, conflicting medication plan.',
    docType: 'Discharge instructions',
    category: 'discharge',
    image: '/samples/david-discharge.png',
    text: `Riverside General Hospital — Discharge Instructions
Patient: David O.   Discharge Date: 06/15/2026   Dept: Emergency
Diagnosis: Laceration to right forearm, sutured.
MEDICATIONS: Amoxicillin 500mg — take 1 capsule by mouth three times daily for 7 days. Ibuprofen 400mg — take 1 tablet every 4 hours as needed for pain; do not exceed 3 tablets in 24 hours.
WOUND CARE: Keep dressing clean and dry. Do not submerge for 48 hours.
FOLLOW-UP: Return to your primary care provider for suture removal in 10–14 days.
RETURN TO THE ER IMMEDIATELY IF: fever above 101°F, increasing redness, swelling, pus, or red streaking from the wound.
ACTIVITY: No heavy lifting over 10 lbs for 1 week.`,
  },
];
