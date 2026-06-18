import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { openai, CHAT_MODEL, tuneParams } from '@/lib/ai';

// Translate ENVIS advisor text into another language while keeping the calm,
// plain tone and any markdown structure intact.
export async function POST(req: Request) {
  try {
    const { text, language } = await req.json();
    if (!text || !language) {
      return NextResponse.json({ error: 'text and language are required' }, { status: 400 });
    }

    const params = tuneParams(
      {
        model: CHAT_MODEL,
        messages: [
          {
            role: 'system',
            content:
              language === 'Simple English'
                ? `You rewrite text for ENVIS in VERY simple English — like explaining to a worried 10-year-old (about a 5th-grade reading level).

Rules:
- Short sentences. Common words. One idea per sentence. Explain any term you must keep.
- Keep all the real facts: amounts, dates, ID/account numbers, names, email addresses — unchanged.
- Preserve markdown structure (headings, bullets, bold, quotes).
- Stay warm and calm. Output ONLY the rewritten text, nothing else.`
                : `You are a translator for ENVIS, a calm assistant that helps people understand scary documents. Translate the user's message into ${language}.

Rules:
- Keep the warm, plain, reassuring tone — translate the feeling, not just the words.
- Preserve all markdown structure (headings, bullet points, bold, quotes) exactly.
- Keep currency amounts, dates, ID/account numbers, proper nouns, and email addresses unchanged.
- Use natural, everyday ${language} a worried person would find easy to read — not formal or robotic.
- Output ONLY the translation, nothing else.`,
          },
          { role: 'user', content: text },
        ],
      } as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming,
      CHAT_MODEL,
      0.3
    );

    const completion = await openai.chat.completions.create(params);
    return NextResponse.json({ translation: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error in localize route:', error);
    return NextResponse.json({ error: 'Failed to translate' }, { status: 500 });
  }
}
