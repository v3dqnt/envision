import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'medical';

  const responseData = {
    medical: {
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
        },
        {
          id: "step-2",
          step: "Call your insurance provider to cross-reference with your EOB (Explanation of Benefits).",
          rationale: "Ensure they processed the claim correctly."
        }
      ],
      emergencyResources: [
        {
          name: "Patient Advocate Foundation",
          contact: "1-800-532-5274",
          description: "Helps patients resolve billing, insurance, and financial hurdles.",
          url: "https://www.patientadvocate.org"
        }
      ]
    },
    eviction: {
      summary: {
        whatIsHappening: "You received a landlord notice to vacate/eviction warning.",
        doINeedToPanic: "No, this is a notification, not a final court order. You have tenant rights and options to respond.",
        mainThingToDo: "Contact a local tenant legal aid center or respond to the landlord in writing."
      },
      deadlines: [
        {
          date: "2026-07-01",
          description: "Notice to vacate deadline",
          urgency: "high"
        }
      ],
      jargon: [
        {
          term: "Notice to Vacate",
          simpleDefinition: "A landlord's written request telling you to leave the rental property. It is not an official court order."
        }
      ],
      checklist: [
        {
          id: "step-1",
          step: "Review your lease agreement for notices and grace periods.",
          rationale: "Landlords must strictly follow the notice requirements in the lease and state law."
        },
        {
          id: "step-2",
          step: "Respond to the landlord in writing regarding the payment or status.",
          rationale: "Documenting communication protects your legal rights."
        }
      ],
      emergencyResources: [
        {
          name: "Tenant Law Center",
          contact: "1-800-555-0199",
          description: "Provides free legal assistance and advocacy for tenants facing eviction.",
          url: "https://example.com/tenant-law-center"
        }
      ]
    },
    debt: {
      summary: {
        whatIsHappening: "You received a debt collection warning.",
        doINeedToPanic: "No, don't panic. You have 30 days to request debt validation, and collectors must verify it.",
        mainThingToDo: "Request debt validation in writing from the collector."
      },
      deadlines: [
        {
          date: "2026-07-16",
          description: "30-day debt validation request window",
          urgency: "medium"
        }
      ],
      jargon: [
        {
          term: "Debt Validation",
          simpleDefinition: "A legal process where a debt collector must provide written proof that you actually owe the money."
        }
      ],
      checklist: [
        {
          id: "step-1",
          step: "Send a written debt validation letter within 30 days.",
          rationale: "By law, collectors must cease contact until they verify the debt once you request validation."
        },
        {
          id: "step-2",
          step: "Check your credit report for unauthorized inquiries or entries.",
          rationale: "Incorrect debt entries can damage your credit score."
        }
      ],
      emergencyResources: [
        {
          name: "Consumer Financial Protection Bureau",
          contact: "1-855-411-2372",
          description: "Federal agency that helps protect consumers from unfair or deceptive debt collection practices.",
          url: "https://www.consumerfinance.gov"
        }
      ]
    }
  };

  const data = responseData[category as 'medical' | 'eviction' | 'debt'] || responseData.medical;
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const text = body.text || '';
  const lowerText = text.toLowerCase();
  
  let category: 'medical' | 'eviction' | 'debt' = 'medical';
  if (lowerText.includes('evict') || lowerText.includes('tenant') || lowerText.includes('landlord') || lowerText.includes('vacate')) {
    category = 'eviction';
  } else if (lowerText.includes('debt') || lowerText.includes('collector') || lowerText.includes('owe') || lowerText.includes('credit')) {
    category = 'debt';
  }

  return NextResponse.json({ category });
}
