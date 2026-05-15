import { create } from "zustand";
import {
  api,
  type Message,
  type Conversation,
  type Memory,
} from "@/lib/api";
import {
  createProvider,
  type AIProvider,
  type AIProviderId,
  type AIMessage,
  type AIStreamChunk,
  type AIResponse,
  buildRecruiterSystemPrompt,
} from "@/lib/ai-provider";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  isStreaming: boolean;
  streamingContent: string;
  suggestions: string[];
  memoryContext: Memory[];
  activeProvider: AIProviderId;
  activeModel: string;
  streamController: AbortController | null;

  sendMessage: (message: string) => Promise<void>;
  sendMessageStream: (message: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  newConversation: () => void;
  setProvider: (providerId: AIProviderId) => void;
  abortStream: () => void;
  loadMemoryContext: (query: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoading: false,
  isSending: false,
  isStreaming: false,
  streamingContent: "",
  suggestions: [],
  memoryContext: [],
  activeProvider: "mimo" as AIProviderId,
  activeModel: "mimo-v2.5-pro",
  streamController: null,

  setProvider: (providerId) => {
    set({
      activeProvider: providerId,
      activeModel:
        providerId === "mimo"
          ? "mimo-v2.5-pro"
          : providerId === "openai"
            ? "gpt-4o-mini"
            : providerId === "anthropic"
              ? "claude-3-5-sonnet-20241022"
              : "custom-model",
    });
  },

  abortStream: () => {
    const controller = get().streamController;
    if (controller) {
      controller.abort();
      set({ isStreaming: false, isSending: false, streamController: null });
    }
  },

  loadMemoryContext: async (query) => {
    try {
      const memories = await api.memoryContext.getForQuery(query);
      set({ memoryContext: memories });
    } catch {
      // Non-critical - silently fail
    }
  },

  sendMessage: async (message) => {
    set({ isSending: true });

    try {
      const conversationId = get().activeConversation?.id;
      const providerId = get().activeProvider;

      // Load memory context for the query
      await get().loadMemoryContext(message);

      const res = await api.chat.send({
        message,
        conversation_id: conversationId,
      });

      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: "user-" + Date.now(),
            role: "user",
            content: message,
            created_at: new Date().toISOString(),
          },
          res.message,
        ],
        activeConversation: state.activeConversation || {
          id: res.conversation_id,
          is_active: true,
          created_at: new Date().toISOString(),
          messages: [],
        },
        suggestions: res.suggestions,
        isSending: false,
      }));

      if (!get().activeConversation) {
        set((state) => ({
          activeConversation: {
            ...state.activeConversation!,
            id: res.conversation_id,
          },
        }));
      }
    } catch (err) {
      set({ isSending: false });
      throw err;
    }
  },

  sendMessageStream: async (message) => {
    const providerId = get().activeProvider;
    const provider = createProvider(providerId);

    set({
      isSending: true,
      isStreaming: true,
      streamingContent: "",
      suggestions: [],
    });

    const userMessage: Message = {
      id: "user-" + Date.now(),
      role: "user",
      content: message,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
    }));

    // Load memory context in parallel
    get().loadMemoryContext(message);

    const conversationId = get().activeConversation?.id;
    const memoryContext = get().memoryContext.map((m) => m.content);
    const systemPrompt = buildRecruiterSystemPrompt(memoryContext);

    const aiMessages: AIMessage[] = [
      { role: "system", content: systemPrompt },
      ...get().messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const controller = provider.sendMessageStream(
      aiMessages,
      {
        onChunk: (chunk: AIStreamChunk) => {
          set((state) => ({
            streamingContent: state.streamingContent + chunk.content,
          }));
        },
        onComplete: (response: AIResponse) => {
          const assistantMessage: Message = {
            id: "assistant-" + Date.now(),
            role: "assistant",
            content: response.content,
            model_used: response.model,
            created_at: new Date().toISOString(),
          };

          set((state) => ({
            messages: [...state.messages, assistantMessage],
            streamingContent: "",
            isStreaming: false,
            isSending: false,
            streamController: null,
            activeConversation: state.activeConversation || {
              id: response.conversationId || "",
              is_active: true,
              created_at: new Date().toISOString(),
              messages: [],
            },
            suggestions: [
              "Show me more details",
              "Generate outreach",
              "Find similar candidates",
            ],
          }));
        },
        onError: (error: Error) => {
          set({ isStreaming: false, isSending: false, streamController: null });

          const errorMessage: Message = {
            id: "error-" + Date.now(),
            role: "assistant",
            content:
              "I encountered an error processing your request. Please check your AI provider configuration and try again.",
            created_at: new Date().toISOString(),
          };
          set((state) => ({
            messages: [...state.messages, errorMessage],
          }));
        },
      },
      conversationId
    );

    set({ streamController: controller });
  },

  loadConversations: async () => {
    set({ isLoading: true });
    try {
      const conversations = await api.conversations.list();
      set({ conversations, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  selectConversation: async (id) => {
    set({ isLoading: true });
    try {
      const conversation = await api.conversations.get(id);
      set({
        activeConversation: conversation,
        messages: conversation.messages,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  newConversation: () => {
    set({
      activeConversation: null,
      messages: [],
      suggestions: [],
      memoryContext: [],
    });
  },
}));
