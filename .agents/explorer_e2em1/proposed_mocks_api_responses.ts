export interface TranslationResponse {
  summary: {
    whatIsHappening: string;
    doINeedToPanic: string;
    mainThingToDo: string;
  };
  deadlines: Array<{
    date: string;
    description: string;
    urgency: 'high' | 'medium' | 'low';
  }>;
  jargon: Array<{
    term: string;
    simpleDefinition: string;
  }>;
  checklist: Array<{
    id: string;
    step: string;
    rationale: string;
  }>;
  emergencyResources: Array<{
    name: string;
    contact: string;
    description: string;
  }>;
}

export interface DraftResponse {
  draft: string;
}

export const MOCK_TRANSLATION_RESPONSE: TranslationResponse = {
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
      description: "Helps patients resolve billing, insurance, and financial hurdles."
    }
  ]
};

export const MOCK_DRAFT_RESPONSE: DraftResponse = {
  draft: "Dear General Clinic,\n\nI am writing to formally request an itemized billing statement for account number..."
};
