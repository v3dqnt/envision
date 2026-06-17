import { NextResponse } from 'next/server';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { openai, ANALYZE_MODEL, REASONING_EFFORT, isReasoningModel } from '@/lib/ai';

const AnalysisSchema = z.object({
  summary: z.object({
    whatIsHappening: z.string().describe("A brief, empathetic explanation of what the document is about."),
    doINeedToPanic: z.string().describe("A calming sentence answering if the user should panic, usually 'No, ...'"),
    mainThingToDo: z.string().describe("The single most important next step the user should take.")
  }),
  deadlines: z.array(z.object({
    date: z.string().describe("The deadline date mentioned or inferred, e.g., '2026-07-16'"),
    description: z.string().describe("What is due or happening on this date"),
    urgency: z.enum(["high", "medium", "low"])
  })),
  jargon: z.array(z.object({
    term: z.string().describe("A confusing legal, medical, or technical term found in the text"),
    simpleDefinition: z.string().describe("A plain-English explanation of the term")
  })),
  checklist: z.array(z.object({
    id: z.string(),
    step: z.string().describe("An actionable step the user should take"),
    rationale: z.string().describe("Why this step is important")
  })),
  emergencyResources: z.array(z.object({
    name: z.string().describe("Name of a relevant support organization (e.g. legal aid, financial ombudsman)"),
    contact: z.string().describe("Phone number or email"),
    description: z.string().describe("What they help with"),
    url: z.string().describe("Website URL")
  })),
  draft: z.object({
    normal: z.string().describe("A polite, standard response letter addressing the document's sender."),
    firm: z.string().describe("A firm, legally-protective response letter addressing the document's sender.")
  })
});

export async function POST(req: Request) {
  try {
    const { text, imageUrl } = await req.json();

    if (!text && !imageUrl) {
      return NextResponse.json({ error: 'Text or imageUrl is required' }, { status: 400 });
    }

    const content: any[] = [];
    if (text) {
      content.push({ type: "text", text: `Please analyze the following document text and extract the required structured information:\n\n${text}` });
    } else {
      content.push({ type: "text", text: `Please analyze the attached document image and extract the required structured information.` });
    }
    
    if (imageUrl) {
      content.push({ type: "image_url", image_url: { url: imageUrl } });
    }

    const completion = await openai.chat.completions.parse({
      model: ANALYZE_MODEL,
      ...(isReasoningModel(ANALYZE_MODEL) ? { reasoning_effort: REASONING_EFFORT as any } : {}),
      messages: [
        {
          role: "system",
          content: `You are ENVIS — a calm, sharp friend who actually investigates a document, not a bot that hands back generic steps. Read confusing, intimidating documents (medical bills, eviction notices, debt collections, legal notices) and fill the structured fields with SPECIFIC, reasoned insight about THIS document — never boilerplate.

Key principles:
- Localize first. Detect the country/region/currency from the document and judge everything against LOCAL norms, prices, and laws — not US defaults.
- Scrutinize the actual numbers and line items. In summary.whatIsHappening and the checklist, point at specific charges/clauses that look fair, questionable, or inflated, and say why. For a medical bill, the consumables, "misc", and investigations lines are usually where overcharging hides — call those out by name and amount.
- Catch inconsistencies (mismatched dates, math errors, template lines that don't apply).
- In emergencyResources, name REAL programs for the user's location (e.g. for India: CMCHIS, Ayushman Bharat/PM-JAY, ESI; for the US: hospital charity care, Medicaid; for tenants: local legal aid). Don't invent contact details — if unsure of a number, give the official org name and website and leave contact as the general helpline.
- checklist.step must be a concrete action tied to what you found ("ask billing why consumables is ₹2,118"), not "review the charges for errors".
- Calm, warm, plain language (~grade 6-8). Never alarmist, never pure boilerplate.`
        },
        {
          role: "user",
          content: content
        }
      ],
      response_format: zodResponseFormat(AnalysisSchema, "analysis_result"),
    });

    const result = completion.choices[0].message.parsed;

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error analyzing document:', error);
    return NextResponse.json({ error: 'Failed to analyze document' }, { status: 500 });
  }
}
