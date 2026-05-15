"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
import { AuthForm } from "@/components/auth/AuthForm";
import DashboardPage from "./dashboard/page";

export default function Home() {
  const { user, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  if (!user) {
    return <AuthForm />;
  }

  return <DashboardPage />;
}
