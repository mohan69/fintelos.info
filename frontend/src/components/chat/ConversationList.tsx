"use client";

import { useEffect } from "react";
import { useChatStore } from "@/stores/chat";
import { cn } from "@/lib/utils";
import { MessageSquare, Plus } from "lucide-react";

export function ConversationList() {
  const { conversations, activeConversation, loadConversations, selectConversation, newConversation } = useChatStore();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <div className="flex flex-col w-72 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="text-sm font-semibold">Conversations</h3>
        <button
          onClick={newConversation}
          className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => selectConversation(conv.id)}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left text-sm transition-colors",
              activeConversation?.id === conv.id
                ? "bg-white dark:bg-zinc-800 shadow-sm"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
            )}
          >
            <MessageSquare className="w-4 h-4 text-zinc-400 shrink-0" />
            <span className="truncate text-zinc-700 dark:text-zinc-300">
              {conv.title || "New conversation"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
