"use client";

import { useAuthStore } from "@/stores/auth";
import { AuthForm } from "@/components/auth/AuthForm";
import { AppShell } from "@/components/layout/AppShell";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWorkspace } from "@/components/chat/ChatWorkspace";
import { useEffect } from "react";

export default function Home() {
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
