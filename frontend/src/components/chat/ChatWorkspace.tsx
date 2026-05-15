"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/stores/chat";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { MemoryContext } from "@/components/ai/MemoryContext";
import { TypingIndicator, PulseDot } from "@/components/ui/animated";
import { Sparkles, Square, Zap, Users, Send, Workflow } from "lucide-react";

export function ChatWorkspace() {
  const {
    messages,
    isSending,
    isStreaming,
    streamingContent,
    suggestions,
    sendMessageStream,
    abortStream,
  } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  return (
    <div className="flex flex-col h-full">
      {/* Memory context panel */}
      <MemoryContext />

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <AnimatePresence mode="wait">
          {messages.length === 0 && !isStreaming ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                className="flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 mb-6"
              >
                <Sparkles className="w-10 h-10 text-indigo-400" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-semibold mb-3 gradient-text"
              >
                Fintelos Copilot
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-muted max-w-md text-sm leading-relaxed"
              >
                Your AI-native talent intelligence assistant. Ask me to find
                candidates, analyze talent, generate outreach, or build sourcing
                workflows.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 gap-3 mt-10 max-w-lg w-full"
              >
                {[
                  { text: "Find backend engineers in Bangalore", icon: Users },
                  { text: "Show me senior Python developers", icon: Zap },
                  { text: "Generate outreach for top candidates", icon: Send },
                  { text: "Create a sourcing workflow for AI engineers", icon: Workflow },
                ].map((s, i) => (
                  <motion.button
                    key={s.text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => sendMessageStream(s.text)}
                    className="flex items-start gap-3 p-4 text-left text-sm rounded-xl border border-border hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group"
                  >
                    <s.icon className="w-4 h-4 text-muted group-hover:text-indigo-400 transition-colors mt-0.5 shrink-0" />
                    <span className="text-foreground/80 group-hover:text-foreground transition-colors">
                      {s.text}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-5"
            >
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {/* Streaming message */}
              <AnimatePresence>
                {isStreaming && streamingContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-3 justify-start"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shrink-0 shadow-sm">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="relative max-w-[70%]">
                      <div className="px-4 py-3 text-sm leading-relaxed bg-surface border border-border rounded-2xl rounded-bl-md">
                        {streamingContent}
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="inline-block w-0.5 h-4 ml-0.5 bg-indigo-500 align-middle"
                        />
                      </div>
                    </div>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={abortStream}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors self-start mt-1"
                      title="Stop generating"
                    >
                      <Square className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Thinking indicator */}
              <AnimatePresence>
                {isSending && !isStreaming && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex gap-3 justify-start"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shrink-0 shadow-sm">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-surface border border-border">
                      <div className="flex items-center gap-2">
                        <TypingIndicator />
                        <span className="text-xs text-muted">Thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ChatInput
        onSend={sendMessageStream}
        isLoading={isSending}
        suggestions={suggestions}
      />
    </div>
  );
}
