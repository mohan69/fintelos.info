"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { Sparkles, Loader2 } from "lucide-react";

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const { login, register, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, fullName, company);
      }
    } catch {
      // error is in store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white dark:bg-zinc-900 shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 mb-4">
            <Sparkles className="w-6 h-6 text-indigo-500" />
          </div>
          <h1 className="text-2xl font-semibold">Welcome to Fintelos</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            AI-Native Talent Intelligence Platform
          </p>
        </div>

        <div className="flex gap-2 mb-6 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === "login"
                ? "bg-white dark:bg-zinc-900 shadow-sm"
                : "text-zinc-500"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === "register"
                ? "bg-white dark:bg-zinc-900 shadow-sm"
                : "text-zinc-500"
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                required
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company (optional)"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </>
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
