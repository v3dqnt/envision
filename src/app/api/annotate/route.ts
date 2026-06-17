import { NextResponse } from 'next/server';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { openai, ANNOTATE_MODEL } from '@/lib/ai';

// Each annotation explains one OCR'd line/region of the document in plain English.
// importance maps to the on-image highlight colour: blue / yellow / green.
const AnnotationSchema = z.object({
  annotations: z.array(
    z.object({
      id: z.string().describe('The exact id of the line being explained, copied from the input.'),
      meaning: z
        .string()
        .describe('A short, plain-English explanation of what this line means or why it matters, in calm friendly language (1-2 sentences).'),
      importance: z
        .enum(['key', 'review', 'fair'])
        .describe(
          "Colour bucket for the highlight. 'key' (BLUE) = a critical fact or required action: a total owed, a deadline, who sent it, an account/case/patient id, a medication dose, the action the reader must take, or an inconsistency like a wrong date. 'review' (YELLOW) = something to question, watch out for, or not miss: a high/vague/suspicious charge, a strict deadline, a warning sign, a document they must provide, or a clause limiting their rights. 'fair' (GREEN) = a line that looks reasonable/routine, reassuring, or in the reader's favour (e.g. support offered)."
        ),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const { lines, fullText, analysisContext } = await req.json();

    if (!Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ error: 'lines array is required' }, { status: 400 });
    }

    // Keep the payload focused: only id + text per line.
    const compactLines = lines.map((l: { id: string; text: string }) => ({
      id: l.id,
      text: l.text,
    }));

    // If the chat already produced an analysis, feed it in so the on-image
    // highlights flag the SAME oddities the advisor called out.
    const alignmentNote = analysisContext
      ? `\n\nThe ENVIS advisor already reviewed this document and wrote the analysis below. Your highlights MUST be consistent with it — anything the advisor flagged as suspicious, high, vague, or wrong gets 'review' (yellow); the critical facts and inconsistencies it called out get 'key' (blue); lines it judged reasonable get 'fair' (green).\n\nADVISOR ANALYSIS:\n${analysisContext}`
      : '';

    const completion = await openai.chat.completions.parse({
      model: ANNOTATE_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are ENVIS — a calm friend who explains a confusing document line by line so the reader understands every part of it.

You receive the lines of one document (each with an id). For EVERY line, write a short plain-English "meaning" — what that line is actually saying or why it matters — as if leaning over and pointing at it.

Rules:
- Localize: judge amounts, terms, and laws against the document's own country/region and currency, not US defaults.
- Be specific to the line. For a charge, say what the item is and whether the amount looks fair, high, or worth questioning for that region. For jargon, a code, or bureaucratic wording, translate it plainly. For a date or deadline, say what has to happen by then and what happens if it's missed. For a required action or document, say what the reader actually needs to do or bring.
- Mark importance as a colour bucket: 'key' (blue) for critical facts and inconsistencies (total owed, due date, sender, account/patient id, a wrong/mismatched date), 'review' (yellow) for anything to question or get itemised (an inflated, vague, or suspicious charge, a strict deadline, a clause limiting the reader's rights), 'fair' (green) for lines that look reasonable/standard or are routine boilerplate.
- Keep each meaning to 1-2 short sentences, grade 6-8 reading level. Warm, never alarmist.
- Skip nothing: return one annotation per input line, reusing the exact id. If a line is just noise/letterhead, give it a brief 'fair' meaning.${alignmentNote}`,
        },
        {
          role: 'user',
          content:
            `Here is the full document text for context:\n\n${fullText || compactLines.map((l) => l.text).join('\n')}\n\n` +
            `Now explain each of these lines (JSON):\n\n${JSON.stringify(compactLines)}`,
        },
      ],
      response_format: zodResponseFormat(AnnotationSchema, 'annotations'),
    });

    const result = completion.choices[0].message.parsed;
    return NextResponse.json(result ?? { annotations: [] });
  } catch (error) {
    console.error('Error annotating document:', error);
    return NextResponse.json({ error: 'Failed to annotate document' }, { status: 500 });
  }
}
