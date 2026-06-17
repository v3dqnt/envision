import { StateGraph, Annotation, Send, START, END } from '@langchain/langgraph';
import { openai, REASONING_EFFORT, isReasoningModel } from '@/lib/ai';

// A smaller/faster model for the many research calls; synthesis quality still good.
const RESEARCH_MODEL = process.env.OPENAI_RESEARCH_MODEL || 'gpt-5-mini';

export interface Finding {
  topic: string;
  summary: string;
  sources: { title: string; url: string }[];
}

// One LLM call, with the right tuning for reasoning vs classic models.
async function llm(system: string, user: string, json = false): Promise<string> {
  const params: any = {
    model: RESEARCH_MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  };
  if (isReasoningModel(RESEARCH_MODEL)) {
    // Keep research nodes snappier than the main advisor.
    params.reasoning_effort = REASONING_EFFORT === 'high' ? 'medium' : REASONING_EFFORT;
  } else {
    params.temperature = 0.3;
  }
  if (json) params.response_format = { type: 'json_object' };
  const c = await openai.chat.completions.create(params);
  return c.choices[0].message.content || '';
}

// Tavily web search (classic REST: api_key in body).
async function tavily(query: string, maxResults = 4) {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return { answer: '', results: [] as any[] };
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: key,
        query,
        max_results: maxResults,
        search_depth: 'advanced',
        include_answer: true,
      }),
    });
    if (!res.ok) {
      console.error('Tavily error', res.status, await res.text());
      return { answer: '', results: [] as any[] };
    }
    const data = await res.json();
    return { answer: data.answer || '', results: (data.results || []) as any[] };
  } catch (e) {
    console.error('Tavily fetch failed', e);
    return { answer: '', results: [] as any[] };
  }
}

const last = <T,>(_: T, b: T) => b;

// Shared graph state. `topic` is set per-subagent via Send; `findings` accumulates.
const ResearchState = Annotation.Root({
  documentText: Annotation<string>({ reducer: last, default: () => '' }),
  analysis: Annotation<string>({ reducer: last, default: () => '' }),
  institution: Annotation<string>({ reducer: last, default: () => '' }),
  region: Annotation<string>({ reducer: last, default: () => '' }),
  topics: Annotation<string[]>({ reducer: last, default: () => [] }),
  topic: Annotation<string>({ reducer: last, default: () => '' }),
  findings: Annotation<Finding[]>({ reducer: (a, b) => a.concat(b), default: () => [] }),
  report: Annotation<string>({ reducer: last, default: () => '' }),
});

type State = typeof ResearchState.State;

// 1. PLANNER — identify the institution, region, and what to research in the user's favour.
async function planNode(state: State) {
  const sys = `You plan research to help someone understand or challenge a document (bill, notice, letter). Identify the institution that issued it, the country/region, and 2-4 specific things to look up that could be IN THE USER'S FAVOUR — e.g. the institution's refund/billing/itemisation policy, its complaint or grievance process, or local consumer/patient rights and government schemes that apply. Respond ONLY as JSON: {"institution": string, "region": string, "topics": string[]}. Topics are short, search-worthy phrases.`;
  const user = `DOCUMENT TEXT (may be empty):\n${state.documentText || '(none)'}\n\nADVISOR ANALYSIS OF THE DOCUMENT:\n${state.analysis || '(none)'}`;
  const raw = await llm(sys, user, true);
  let parsed: any = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    /* fall through to defaults */
  }
  const topics: string[] =
    Array.isArray(parsed.topics) && parsed.topics.length
      ? parsed.topics.slice(0, 4)
      : ['billing and refund policy', 'consumer rights and grievance process'];
  return {
    institution: parsed.institution || 'the institution',
    region: parsed.region || '',
    topics,
  };
}

// Fan out: spawn one research subagent per topic (runs in parallel).
function spawnResearchers(state: State) {
  return state.topics.map(
    (t) =>
      new Send('research', {
        institution: state.institution,
        region: state.region,
        topic: t,
        documentText: state.documentText,
        analysis: state.analysis,
      })
  );
}

// 2. RESEARCH SUBAGENT — search the web for one topic and extract what helps the user.
async function researchNode(state: State) {
  const query = `${state.institution} ${state.topic} ${state.region}`.trim();
  const { answer, results } = await tavily(query, 4);
  const context = results
    .map((r, i) => `[${i + 1}] ${r.title} (${r.url})\n${(r.content || '').slice(0, 800)}`)
    .join('\n\n');

  const sys = `You are a researcher helping a user. From the search results, extract ONLY what is concrete and IN THE USER'S FAVOUR about "${state.topic}" for ${state.institution} (${state.region || 'their region'}). Name specific rights, time limits, refund rules, obligations on the institution, or who to escalate to. 2-4 sentences. If the results contain nothing useful, reply exactly "No clear policy found."`;
  const user = `Topic: ${state.topic}\n\nTavily summary: ${answer || '(none)'}\n\nSearch results:\n${context || '(no results)'}`;
  const summary = await llm(sys, user);

  const sources = results
    .slice(0, 3)
    .map((r) => ({ title: r.title as string, url: r.url as string }))
    .filter((s) => s.url);

  return { findings: [{ topic: state.topic, summary, sources }] as Finding[] };
}

// 3. SYNTHESIZER — combine all findings into one calm, structured briefing.
async function synthNode(state: State) {
  const findingsText = state.findings
    .map(
      (f) =>
        `### ${f.topic}\n${f.summary}\nSources: ${f.sources.map((s) => s.url).join(', ') || '(none)'}`
    )
    .join('\n\n');

  const sys = `You are ENVIS, a calm assistant. Turn these research findings into a short, structured briefing about what is IN THE USER'S FAVOUR with ${state.institution}. Use markdown:
- Start with "## What I found in your favour" and one calm sentence.
- Then bullets grouped by topic — each states the concrete right/policy and why it helps them.
- End with a short "**Sources**" list of the actual URLs used.
Be honest if a finding was thin. Keep it tight and practical, no fluff.`;
  const report = await llm(sys, findingsText);
  return { report };
}

const graph = new StateGraph(ResearchState)
  .addNode('plan', planNode)
  .addNode('research', researchNode)
  .addNode('synth', synthNode)
  .addEdge(START, 'plan')
  .addConditionalEdges('plan', spawnResearchers, ['research'])
  .addEdge('research', 'synth')
  .addEdge('synth', END)
  .compile();

export async function runResearch(input: { documentText?: string; analysis?: string }) {
  const result = await graph.invoke({
    documentText: input.documentText || '',
    analysis: input.analysis || '',
  });
  return {
    institution: result.institution,
    region: result.region,
    report: result.report,
    findings: result.findings,
  };
}
