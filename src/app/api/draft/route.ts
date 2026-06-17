import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { openai, CHAT_MODEL, tuneParams } from '@/lib/ai';

const SYSTEM_PROMPT = `You are ENVIS — you write the email or letter the user needs to send, ready to copy and send today.

You receive a document (a medical bill, eviction notice, debt letter, etc.), the advisor's analysis of it, and a requested tone. Write ONE complete message addressed to the right party (hospital billing dept, landlord, debt collector, insurer — infer from the document).

Rules:
- Open with the account/reference details that identify the case (patient/IP/bill/account numbers, dates) so it can be actioned without back-and-forth.
- Make the SPECIFIC asks the analysis surfaced — itemisation of named charges, correcting a wrong date, a settlement receipt, debt validation, etc. Be concrete, reference the actual figures.
- Localize: use the document's country conventions, currency, and the rights/laws that apply there.
- Tone:
  * "normal" = polite, cooperative, firm-but-friendly.
  * "firm" = assertive, rights-aware, makes clear you expect compliance and will escalate if needed — still professional, never threatening or rude.
- Keep it tight and skimmable. Include placeholders in [square brackets] only for things you genuinely can't know (e.g. [Your phone number]).
- Output ONLY the message itself — a subject line then the body. No preamble, no explanation, no markdown fences.`;

export async function POST(req: Request) {
  try {
    const { documentText, documentImageUrl, analysis, tone, instructions } = await req.json();

    const userParts: OpenAI.Chat.ChatCompletionContentPart[] = [];
    userParts.push({
      type: 'text',
      text:
        `Write a ${tone === 'firm' ? 'firm' : 'polite'} response message for this document.\n\n` +
        (documentText ? `DOCUMENT:\n${documentText}\n\n` : 'The document is attached as an image.\n\n') +
        (analysis ? `ADVISOR ANALYSIS (use these specific findings):\n${analysis}\n\n` : '') +
        (instructions ? `EXTRA INSTRUCTIONS FROM THE USER:\n${instructions}\n\n` : ''),
    });
    if (documentImageUrl) {
      userParts.push({ type: 'image_url', image_url: { url: documentImageUrl } });
    }

    const params = tuneParams(
      {
        model: CHAT_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userParts },
        ],
      } as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming,
      CHAT_MODEL,
      0.6
    );

    const completion = await openai.chat.completions.create(params);
    return NextResponse.json({ draft: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error in draft route:', error);
    return NextResponse.json({ error: 'Failed to generate draft' }, { status: 500 });
  }
}
