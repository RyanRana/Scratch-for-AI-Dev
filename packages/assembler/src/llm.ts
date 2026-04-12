export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMRequest {
  messages: LLMMessage[];
  /** Force JSON-mode output. Defaults to true for structured assembly. */
  json?: boolean;
  /** JSON schema the response must conform to. */
  responseSchema?: Record<string, unknown>;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMClient {
  complete(req: LLMRequest): Promise<string>;
}

interface DeepSeekOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export class DeepSeekClient implements LLMClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(opts: DeepSeekOptions = {}) {
    const key = opts.apiKey ?? process.env.DEEPSEEK_API_KEY;
    if (!key) throw new Error("DEEPSEEK_API_KEY not set");
    this.apiKey = key;
    this.baseUrl = opts.baseUrl ?? "https://api.deepseek.com";
    this.model = opts.model ?? "deepseek-chat";
  }

  async complete(req: LLMRequest): Promise<string> {
    const useJson = req.json ?? true;
    const body: Record<string, unknown> = {
      model: this.model,
      messages: req.messages,
      temperature: req.temperature ?? 0.2,
      max_tokens: req.maxTokens ?? 4096,
    };
    if (useJson) body.response_format = { type: "json_object" };
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`DeepSeek failed: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    return data.choices[0]!.message.content;
  }
}

interface OllamaLLMOptions {
  baseUrl?: string;
  model?: string;
}

export class OllamaLLMClient implements LLMClient {
  private baseUrl: string;
  private model: string;

  constructor(opts: OllamaLLMOptions = {}) {
    this.baseUrl = opts.baseUrl ?? "http://localhost:11434";
    this.model = opts.model ?? "deepseek-r1";
  }

  async complete(req: LLMRequest): Promise<string> {
    const useJson = req.json ?? true;
    const body: Record<string, unknown> = {
      model: this.model,
      messages: req.messages,
      stream: false,
      options: { temperature: req.temperature ?? 0.2 },
    };
    if (useJson) body.format = "json";
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`Ollama chat failed: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as { message: { content: string } };
    return data.message.content;
  }
}
