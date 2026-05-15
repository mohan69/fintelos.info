"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
import { AuthForm } from "@/components/auth/AuthForm";
import { AppShell } from "@/components/layout/AppShell";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWorkspace } from "@/components/chat/ChatWorkspace";

export default function ChatPage() {
  const { user, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  if (!user) {
    return <AuthForm />;
  }

  return (
    <AppShell>
      <div className="flex h-full">
        <ConversationList />
        <ChatWorkspace />
      </div>
    </AppShell>
  );
}
