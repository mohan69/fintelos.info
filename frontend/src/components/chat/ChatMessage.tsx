"use client";

import { motion } from "framer-motion";
import { Sparkles, User, Copy, Check } from "lucide-react";
import { type Message } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn("flex gap-3 group", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shrink-0 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-white" />
        </motion.div>
      )}

      <div className="relative max-w-[70%]">
        <div
          className={cn(
            "px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl rounded-br-md shadow-md"
              : "bg-surface border border-border text-foreground rounded-2xl rounded-bl-md"
          )}
        >
          {message.content}
        </div>

        {/* Copy button for assistant messages */}
        {!isUser && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={handleCopy}
            className="absolute -right-2 top-2 p-1.5 rounded-lg bg-surface border border-border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <Copy className="w-3 h-3 text-muted" />
            )}
          </motion.button>
        )}

        {/* Model indicator for assistant messages */}
        {!isUser && message.model_used && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[10px] text-muted mt-1 block"
          >
            {message.model_used}
          </motion.span>
        )}
      </div>

      {isUser && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 shrink-0 shadow-sm"
        >
          <User className="w-4 h-4 text-zinc-300" />
        </motion.div>
      )}
    </motion.div>
  );
}
