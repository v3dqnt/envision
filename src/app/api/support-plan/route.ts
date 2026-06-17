import { NextResponse } from 'next/server';
import { openai, ANNOTATE_MODEL, REASONING_EFFORT, isReasoningModel } from '@/lib/ai';

// Pick which nearby-support resource types fit a specific document. The model
// may only choose from `options` (a fixed vocabulary) — we ignore anything else.
export async function POST(req: Request) {
  try {
    const { category, analysis, options } = await req.json();
    const vocab: string[] = Array.isArray(options) ? options : [];
    if (vocab.length === 0) return NextResponse.json({ resources: [] });

    const params: any = {
      model: ANNOTATE_MODEL,
      messages: [
        {
          role: 'system',
          content: `You choose which kinds of local, in-person support would actually help someone with their document. Pick the 3-5 most relevant resource types from this exact list (return their keys verbatim): ${vocab.join(', ')}.

Think about what the person needs on the ground — e.g. a food-assistance notice → food_bank, social_facility; a hospital discharge → pharmacy, clinic; an eviction/housing letter → government, social_facility, library (free help/printing). Respond ONLY as JSON: {"resources": string[]}.`,
        },
        {
          role: 'user',
          content: `Document type: ${category || 'unknown'}\n\nAdvisor analysis:\n${(analysis || '').slice(0, 2000) || '(none)'}`,
        },
      ],
      response_format: { type: 'json_object' },
    };
    if (isReasoningModel(ANNOTATE_MODEL)) params.reasoning_effort = REASONING_EFFORT === 'high' ? 'low' : REASONING_EFFORT;

    const completion = await openai.chat.completions.create(params);
    let resources: string[] = [];
    try {
      const parsed = JSON.parse(completion.choices[0].message.content || '{}');
      if (Array.isArray(parsed.resources)) resources = parsed.resources.filter((k: string) => vocab.includes(k));
    } catch {
      /* fall back to empty → client uses defaults */
    }
    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Error in support-plan route:', error);
    return NextResponse.json({ resources: [] });
  }
}
