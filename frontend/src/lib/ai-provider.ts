/**
 * AI Provider Abstraction Layer
 *
 * Supports multiple AI providers with a unified interface.
 * Primary provider: mimo-v2.5-pro
 * Features: streaming, retry handling, structured responses, async execution.
 */

export type AIProviderId = "mimo" | "openai" | "anthropic" | "custom";

export interface AIProviderConfig {
  id: AIProviderId;
  name: string;
  model: string;
  baseUrl?: string;
  apiKey?: string;
  maxRetries?: number;
  timeout?: number;
  temperature?: number;
  maxTokens?: number;
}

export interface AIStreamChunk {
  content: string;
  done: boolean;
  conversationId?: string;
  model?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: AIProviderId;
  conversationId?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  suggestions?: string[];
}

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIStreamCallbacks {
  onChunk: (chunk: AIStreamChunk) => void;
  onComplete: (response: AIResponse) => void;
  onError: (error: Error) => void;
}

export interface AIProvider {
  readonly config: AIProviderConfig;
  readonly isAvailable: boolean;

  sendMessage(
    messages: AIMessage[],
    conversationId?: string
  ): Promise<AIResponse>;

  sendMessageStream(
    messages: AIMessage[],
    callbacks: AIStreamCallbacks,
    conversationId?: string
  ): AbortController;

  healthCheck(): Promise<boolean>;
}

// Default provider configurations
const PROVIDER_CONFIGS: Record<AIProviderId, Partial<AIProviderConfig>> = {
  mimo: {
    id: "mimo",
    name: "Mimo v2.5 Pro",
    model: "mimo-v2.5-pro",
    maxRetries: 3,
    timeout: 30000,
    temperature: 0.7,
    maxTokens: 4096,
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    model: "gpt-4o-mini",
    maxRetries: 3,
    timeout: 30000,
    temperature: 0.7,
    maxTokens: 4096,
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    model: "claude-3-5-sonnet-20241022",
    maxRetries: 3,
    timeout: 60000,
    temperature: 0.7,
    maxTokens: 4096,
  },
  custom: {
    id: "custom",
    name: "Custom Provider",
    model: "custom-model",
    maxRetries: 2,
    timeout: 30000,
    temperature: 0.7,
    maxTokens: 4096,
  },
};

/**
 * Creates an AI provider instance that delegates to the backend API.
 * The backend handles the actual provider communication.
 */
export function createProvider(
  providerId: AIProviderId,
  overrides?: Partial<AIProviderConfig>
): AIProvider {
  const baseConfig = PROVIDER_CONFIGS[providerId];
  const config: AIProviderConfig = {
    ...baseConfig,
    ...overrides,
    id: providerId,
  } as AIProviderConfig;

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

  const getAuthHeaders = (): Record<string, string> => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "X-AI-Provider": config.id,
      "X-AI-Model": config.model,
    };
  };

  const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    retries: number = config.maxRetries || 3
  ): Promise<T> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        if (attempt === retries) throw err;
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw new Error("Max retries exceeded");
  };

  return {
    get config() {
      return config;
    },

    get isAvailable() {
      return true; // Backend proxy handles availability
    },

    async sendMessage(
      messages: AIMessage[],
      conversationId?: string
    ): Promise<AIResponse> {
      return retryWithBackoff(async () => {
        const res = await fetch(`${API_BASE}/api/v1/chat/`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            message: messages[messages.length - 1]?.content || "",
            conversation_id: conversationId,
            provider: config.id,
            model: config.model,
            temperature: config.temperature,
            max_tokens: config.maxTokens,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`AI provider error: ${res.status} - ${errText}`);
        }

        const data = await res.json();

        return {
          content: data.message?.content || "",
          model: config.model,
          provider: config.id,
          conversationId: data.conversation_id,
          suggestions: data.suggestions,
        };
      });
    },

    sendMessageStream(
      messages: AIMessage[],
      callbacks: AIStreamCallbacks,
      conversationId?: string
    ): AbortController {
      const controller = new AbortController();

      const execute = async () => {
        let retryCount = 0;
        const maxRetries = config.maxRetries || 3;

        while (retryCount <= maxRetries) {
          try {
            const res = await fetch(`${API_BASE}/api/v1/chat/stream`, {
              method: "POST",
              headers: getAuthHeaders(),
              body: JSON.stringify({
                message: messages[messages.length - 1]?.content || "",
                conversation_id: conversationId,
                provider: config.id,
                model: config.model,
                temperature: config.temperature,
                max_tokens: config.maxTokens,
              }),
              signal: controller.signal,
            });

            if (!res.ok) {
              const errText = await res.text();
              throw new Error(
                `AI stream error: ${res.status} - ${errText}`
              );
            }

            const reader = res.body?.getReader();
            if (!reader) throw new Error("No response body reader");

            const decoder = new TextDecoder();
            let fullContent = "";
            let finalConversationId = conversationId;

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split("\n");

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  try {
                    const data = JSON.parse(line.slice(6));

                    if (data.error) {
                      throw new Error(data.error);
                    }

                    if (data.content) {
                      fullContent += data.content;
                      callbacks.onChunk({
                        content: data.content,
                        done: false,
                        model: config.model,
                      });
                    }

                    if (data.done) {
                      finalConversationId =
                        data.conversation_id || finalConversationId;
                    }
                  } catch (parseErr) {
                    // Skip invalid JSON lines
                  }
                }
              }
            }

            callbacks.onComplete({
              content: fullContent,
              model: config.model,
              provider: config.id,
              conversationId: finalConversationId,
            });

            return; // Success - exit retry loop
          } catch (err: any) {
            if (err.name === "AbortError") return;

            retryCount++;
            if (retryCount > maxRetries) {
              callbacks.onError(
                err instanceof Error
                  ? err
                  : new Error("Stream failed after retries")
              );
              return;
            }

            // Exponential backoff
            await new Promise((r) =>
              setTimeout(r, Math.pow(2, retryCount) * 1000)
            );
          }
        }
      };

      execute();
      return controller;
    },

    async healthCheck(): Promise<boolean> {
      try {
        const res = await fetch(`${API_BASE}/api/v1/health`, {
          headers: getAuthHeaders(),
          signal: AbortSignal.timeout(5000),
        });
        return res.ok;
      } catch {
        return false;
      }
    },
  };
}

/**
 * Default provider registry
 */
class ProviderRegistry {
  private providers: Map<AIProviderId, AIProvider> = new Map();
  private activeProviderId: AIProviderId = "mimo";

  register(providerId: AIProviderId, overrides?: Partial<AIProviderConfig>) {
    const provider = createProvider(providerId, overrides);
    this.providers.set(providerId, provider);
    return provider;
  }

  get(providerId?: AIProviderId): AIProvider {
    const id = providerId || this.activeProviderId;
    if (!this.providers.has(id)) {
      this.register(id);
    }
    return this.providers.get(id)!;
  }

  getActive(): AIProvider {
    return this.get(this.activeProviderId);
  }

  setActive(providerId: AIProviderId) {
    this.activeProviderId = providerId;
    if (!this.providers.has(providerId)) {
      this.register(providerId);
    }
  }

  getActiveId(): AIProviderId {
    return this.activeProviderId;
  }

  listProviders(): AIProviderId[] {
    return Array.from(this.providers.keys());
  }
}

// Singleton registry
export const providerRegistry = new ProviderRegistry();

// Register default provider
providerRegistry.register("mimo");

/**
 * Convenience function to get the active AI provider
 */
export function getActiveProvider(): AIProvider {
  return providerRegistry.getActive();
}

/**
 * Build system prompt for the recruiting copilot
 */
export function buildRecruiterSystemPrompt(memoryContext?: string[]): string {
  let prompt = `You are Fintelos, an AI-native talent intelligence copilot for recruiters.

Your capabilities:
- Search and rank candidates using semantic understanding
- Analyze candidate profiles, skills, and experience
- Generate personalized outreach messages
- Provide insights on talent markets and compensation
- Remember recruiter preferences and patterns
- Build sourcing workflows and strategies

Guidelines:
- Be concise and actionable in your responses
- When showing candidates, highlight key qualifications and fit
- Provide data-driven insights when available
- Ask clarifying questions when the request is ambiguous
- Use structured formats (lists, comparisons) for complex information`;

  if (memoryContext && memoryContext.length > 0) {
    prompt += `\n\nRecruiter Context (from memory):\n${memoryContext.map((m) => `- ${m}`).join("\n")}`;
  }

  return prompt;
}
