export const PRESET_DATA = {
  medical: {
    text: "General Clinic Hospital Bill. Date: 2026-06-16. Total amount due: $1,200.00. Please pay by 2026-07-16 or contact billing.",
    summary: {
      whatIsHappening: "You received a hospital bill for $1,200.00 from General Clinic.",
      doINeedToPanic: "No, this is a standard bill and you have time to request an itemized statement or appeal.",
      mainThingToDo: "Contact your insurance company to check coverage and request an itemized bill from the clinic."
    },
    deadlines: [
      {
        date: "2026-07-16",
        description: "Payment due date or request appeal",
        urgency: "high" as const
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
    ],
    draft: {
      normal: "Dear General Clinic,\n\nI am writing to formally request an itemized billing statement for my recent visit. Please send the document to the address on file.",
      firm: "Dear General Clinic,\n\nI am writing to formally dispute the balance of $1,200.00. I demand a complete itemized bill with CPT codes, and please suspend collections during this review."
    }
  },
  eviction: {
    text: "LANDLORD NOTICE TO EVICT. Date: 2026-06-16. You are hereby notified that you must vacate the premises at 123 Pine St by 2026-07-01 due to unpaid rent.",
    summary: {
      whatIsHappening: "You received a landlord notice to vacate/eviction warning.",
      doINeedToPanic: "No, this is a notification, not a final court order. You have tenant rights and options to respond.",
      mainThingToDo: "Contact a local tenant legal aid center or respond to the landlord in writing."
    },
    deadlines: [
      {
        date: "2026-07-01",
        description: "Notice to vacate deadline",
        urgency: "high" as const
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
    ],
    draft: {
      normal: "Dear Landlord,\n\nI am writing to acknowledge receipt of your notice. I would like to discuss a payment arrangement to resolve the outstanding rent.",
      firm: "Dear Landlord,\n\nI am writing in response to the notice to vacate. Under local landlord-tenant laws, I am contesting this notice as I review my options."
    }
  },
  debt: {
    text: "DEBT COLLECTION NOTICE. Total debt: $500.00. Client: Credit Corp. Please pay immediately or face legal action.",
    summary: {
      whatIsHappening: "You received a debt collection warning.",
      doINeedToPanic: "No, don't panic. You have 30 days to request debt validation, and collectors must verify it.",
      mainThingToDo: "Request debt validation in writing from the collector."
    },
    deadlines: [
      {
        date: "2026-07-16",
        description: "30-day debt validation request window",
        urgency: "medium" as const
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
    ],
    draft: {
      normal: "Dear Collector,\n\nI am requesting verification of the alleged debt under the FDCPA. Please send verification documentation.",
      firm: "Dear Collector,\n\nI dispute the validity of the alleged debt of $500.00. Do not contact me by phone; send all communications in writing."
    }
  },
  school: {
    text: "LINCOLN HIGH SCHOOL — Attendance Notice. Date: 2026-06-15. Dear Parent/Guardian of Jordan Lee (Grade 10): Our records show Jordan has 6 unexcused absences this semester. Per district policy, 10 unexcused absences may result in a truancy referral to the county. Please submit any excuse documentation and schedule a meeting with the attendance office by 2026-06-29. Free tutoring and attendance support services are available upon request. Questions: attendance@lincolnhs.edu or (555) 010-4422."
  },
  food: {
    text: "State Department of Human Services — SNAP Recertification Notice. Case #4471902. Date: 2026-06-15. Your Supplemental Nutrition Assistance Program (SNAP) benefits are due for recertification. To keep your benefits, you must complete a recertification interview and submit proof of income, rent/mortgage, and household size by 2026-07-10. If you do not respond by this date, your case will be closed and benefits will stop. To schedule your interview, call 1-800-555-0143 or visit your local office."
  }
};
