import { LLMClient, LLMMessage } from "./llm.js";

const DIRECT_SYSTEM_PROMPT = `You are a Python code generator.
The user will describe a task. Output a complete, runnable Python implementation.
Wrap the entire program in a single \`\`\`python fenced block. No prose outside the block.`;

export interface DirectResult {
  pythonSource: string;
  /** Raw LLM reply, pre-extraction. Kept for debugging. */
  raw: string;
}

/**
 * Fallback code generator used when the block catalog doesn't cover the task.
 * Bypasses retrieval, validation, and compilation entirely — just asks the
 * LLM for Python. Output is *not* a validated pipeline.
 */
export class DirectGenerator {
  constructor(private llm: LLMClient) {}

  async generate(
    goal: string,
    history?: { role: "user" | "assistant"; content: string }[],
  ): Promise<DirectResult> {
    const messages: LLMMessage[] = [
      { role: "system", content: DIRECT_SYSTEM_PROMPT },
      ...(history ?? []),
      { role: "user", content: goal },
    ];
    const raw = await this.llm.complete({ messages, json: false, maxTokens: 8192 });
    return { pythonSource: extractPython(raw), raw };
  }
}

function extractPython(raw: string): string {
  const fenced = raw.match(/```python\n?([\s\S]*?)```/);
  if (fenced) return fenced[1]!.trimEnd();
  const generic = raw.match(/```\n?([\s\S]*?)```/);
  if (generic) return generic[1]!.trimEnd();
  return raw.trim();
}
