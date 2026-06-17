import OpenAI from 'openai';

// Single shared OpenAI client for all server routes.
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Centralized model selection. Swap models per-deployment via env vars
// (OPENAI_CHAT_MODEL, etc.) without touching code. Defaults to GPT-5 family.
// Chat/analyze use full gpt-5 for reasoning quality; annotation stays smaller.
export const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-5';
export const ANALYZE_MODEL = process.env.OPENAI_ANALYZE_MODEL || 'gpt-5';
// Annotation is high-volume / low-complexity, so a smaller model is fine.
export const ANNOTATE_MODEL = process.env.OPENAI_ANNOTATE_MODEL || 'gpt-5-mini';

// How hard reasoning models think. 'high' = best quality (the advisor's core
// value), at some latency cost. Override per-deployment via env.
export const REASONING_EFFORT = process.env.OPENAI_REASONING_EFFORT || 'high';

// GPT-5 and o-series reasoning models only accept the default sampling
// settings — passing a custom temperature/top_p returns a 400. Use this to
// decide whether it's safe to include those params.
export function isReasoningModel(model: string): boolean {
  return /^(gpt-5|o\d)/i.test(model);
}

// Apply the right tuning for a model: reasoning_effort for reasoning models,
// a custom temperature for classic models. Mutates and returns params.
export function tuneParams<T extends Record<string, any>>(params: T, model: string, temperature = 0.7): T {
  if (isReasoningModel(model)) {
    (params as any).reasoning_effort = REASONING_EFFORT;
  } else {
    (params as any).temperature = temperature;
  }
  return params;
}
