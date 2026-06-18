import { NextResponse } from 'next/server';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { openai, ANALYZE_MODEL, REASONING_EFFORT, isReasoningModel } from '@/lib/ai';

const EligibilitySchema = z.object({
  region: z.string().describe('The country/region the suggestions are localized to.'),
  programs: z.array(
    z.object({
      name: z.string().describe('The real program name, e.g. "SNAP", "Medicaid", "Ayushman Bharat".'),
      helpsWith: z.string().describe('One short line on what this program provides.'),
      likelihood: z
        .enum(['likely', 'maybe', 'check'])
        .describe("'likely' = the details given suggest they qualify; 'maybe' = possibly, depends on specifics; 'check' = relevant but eligibility unknown from what we have."),
      why: z.string().describe('Plain-language reason they may qualify + the key eligibility criteria.'),
      howToApply: z.string().describe('The concrete next step to apply (where to go / what to bring).'),
      url: z.string().describe('Official program URL. Use the real official domain; if unsure, leave an empty string.'),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const { documentText, analysis, region, situations, householdSize, incomeBand } = await req.json();

    const completion = await openai.chat.completions.parse({
      model: ANALYZE_MODEL,
      ...(isReasoningModel(ANALYZE_MODEL) ? { reasoning_effort: REASONING_EFFORT as any } : {}),
      messages: [
        {
          role: 'system',
          content: `You are ENVIS. Help a worried person discover government and nonprofit assistance programs they may qualify for — the "find support" half of the job.

Rules:
- Localize to the person's country/region (infer it from the document if not given). US → SNAP, WIC, Medicaid, Section 8/housing vouchers, LIHEAP, TANF, free clinics, school meal programs, legal aid. India → Ayushman Bharat/PM-JAY, ration card/PDS, state health schemes (e.g. CMCHIS), PM-KISAN, scholarships. Use the right programs for the place.
- Suggest 3-6 of the MOST relevant programs for this person's situation and document. Don't pad the list.
- Set likelihood honestly from what you actually know. If you can't tell, use 'check' — never overpromise.
- 'why' should name the real eligibility criteria in plain language so they can self-assess.
- 'howToApply' must be a concrete next step.
- Only give a URL if you're confident it's the official site; otherwise leave it empty. Never invent links.
- Warm, calm, non-judgmental. This is about access, not charity.`,
        },
        {
          role: 'user',
          content: `Region (if provided): ${region || '(infer from document)'}
Household size: ${householdSize || '(not provided)'}
Rough monthly income: ${incomeBand || '(not provided)'}
Things the person says apply to them: ${Array.isArray(situations) && situations.length ? situations.join(', ') : '(none provided)'}

DOCUMENT:
${(documentText || '').slice(0, 3000) || '(none)'}

ADVISOR ANALYSIS:
${(analysis || '').slice(0, 3000) || '(none)'}`,
        },
      ],
      response_format: zodResponseFormat(EligibilitySchema, 'eligibility'),
    });

    return NextResponse.json(completion.choices[0].message.parsed ?? { region: '', programs: [] });
  } catch (error) {
    console.error('Error in eligibility route:', error);
    return NextResponse.json({ error: 'Failed to check eligibility' }, { status: 500 });
  }
}
