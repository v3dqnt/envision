import { NextResponse } from 'next/server';
import { openai, ANNOTATE_MODEL, REASONING_EFFORT, isReasoningModel } from '@/lib/ai';

// One cheap call that, from the document + analysis, produces a short
// content-aware title and decides which "find support" tools are actually
// relevant to this person's problem.
export async function POST(req: Request) {
  try {
    const { documentText, analysis, category } = await req.json();

    const params: any = {
      model: ANNOTATE_MODEL,
      messages: [
        {
          role: 'system',
          content: `You label a document for a list and decide which help tools fit it. Respond ONLY as JSON: {"title": string, "suggestSupport": boolean, "suggestEligibility": boolean}.

- title: 3-6 words, specific to the actual contents — not generic. Good: "Apollo ₹15k inpatient bill", "SNAP recertification — due Jul 10", "School attendance warning (6 absences)", "Section 8 housing eligibility". Bad: "Medical bill", "Document". No quotes, no trailing punctuation.
- suggestSupport: true only if finding nearby in-person places (food banks, free clinics, pharmacies, social-service or government offices, libraries) would genuinely help THIS person. True for food assistance, housing help, needing a clinic/pharmacy/discharge care, applying for benefits in person. False for things resolved by phone/email/paperwork — a billing dispute, a debt-collection letter, a permission slip.
- suggestEligibility: true if the person could plausibly qualify for assistance programs worth checking (food, housing, medical/low-income, benefits, family/disability/senior contexts). False for routine items with no benefit angle (a school permission slip, a simple billing dispute).`,
        },
        {
          role: 'user',
          content: `Document type: ${category || 'unknown'}

DOCUMENT:
${(documentText || '').slice(0, 2500) || '(image only — use the analysis)'}

ANALYSIS:
${(analysis || '').slice(0, 2500)}`,
        },
      ],
      response_format: { type: 'json_object' },
    };
    if (isReasoningModel(ANNOTATE_MODEL)) params.reasoning_effort = REASONING_EFFORT === 'high' ? 'low' : REASONING_EFFORT;

    const completion = await openai.chat.completions.create(params);
    let out = { title: '', suggestSupport: false, suggestEligibility: false };
    try {
      const parsed = JSON.parse(completion.choices[0].message.content || '{}');
      out = {
        title: typeof parsed.title === 'string' ? parsed.title.slice(0, 70) : '',
        suggestSupport: !!parsed.suggestSupport,
        suggestEligibility: !!parsed.suggestEligibility,
      };
    } catch {
      /* defaults */
    }
    return NextResponse.json(out);
  } catch (error) {
    console.error('Error in thread-meta route:', error);
    return NextResponse.json({ title: '', suggestSupport: false, suggestEligibility: false });
  }
}
