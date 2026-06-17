import { NextResponse } from 'next/server';
import { runResearch } from '@/lib/research/graph';

export const maxDuration = 60; // research fans out to several searches + LLM calls

export async function POST(req: Request) {
  try {
    if (!process.env.TAVILY_API_KEY) {
      return NextResponse.json({ error: 'Search is not configured (missing TAVILY_API_KEY).' }, { status: 400 });
    }

    const { documentText, analysis } = await req.json();
    if (!documentText && !analysis) {
      return NextResponse.json({ error: 'documentText or analysis is required' }, { status: 400 });
    }

    const result = await runResearch({ documentText, analysis });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in research route:', error);
    return NextResponse.json({ error: 'Research failed' }, { status: 500 });
  }
}
