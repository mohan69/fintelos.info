"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Paperclip, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  suggestions?: string[];
}

export function ChatInput({ onSend, isLoading, suggestions = [] }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (!message.trim() || isLoading) return;
    onSend(message.trim());
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm">
      {/* Suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="px-6 pt-3 flex flex-wrap gap-2"
          >
            {suggestions.map((s, i) => (
              <motion.button
                key={s}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setMessage(s);
                  textareaRef.current?.focus();
                }}
                className="px-3 py-1.5 text-xs rounded-full border border-border hover:border-indigo-500/30 hover:bg-indigo-500/5 text-muted hover:text-foreground transition-all"
              >
                {s}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="px-6 py-4">
        <div className="flex items-end gap-3 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Fintelos anything about candidates, roles, or sourcing..."
              rows={1}
              className={cn(
                "w-full px-4 py-3 pr-12 text-sm bg-surface border border-border rounded-2xl",
                "focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50",
                "placeholder:text-muted/50 resize-none transition-all",
                "hover:border-border-hover"
              )}
              style={{ maxHeight: "200px" }}
            />

            {/* Character count / shortcuts hint */}
            <div className="absolute right-3 bottom-3 flex items-center gap-1">
              {message.length > 0 && (
                <span className="text-[10px] text-muted/40 mr-1">
                  {message.length}
                </span>
              )}
            </div>
          </div>

          {/* Send button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className={cn(
              "flex items-center justify-center w-11 h-11 rounded-2xl transition-all",
              message.trim() && !isLoading
                ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30"
                : "bg-surface border border-border text-muted"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </motion.button>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="flex justify-center mt-2">
          <span className="text-[10px] text-muted/30">
            Press Enter to send, Shift+Enter for new line
          </span>
        </div>
      </div>
    </div>
  );
}
