"use client";

import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";
import { ProviderStatus } from "@/components/ai/ProviderStatus";
import { motion } from "framer-motion";
import { Moon, Sun, LogOut, User, Command } from "lucide-react";

export function Header() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="flex items-center justify-between px-6 h-14 border-b border-border bg-surface/80 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium text-muted">
          AI-Native Talent Intelligence
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Command palette hint */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs text-muted/60 hover:text-muted hover:border-border-hover transition-colors"
        >
          <Command className="w-3 h-3" />
          <span>⌘K</span>
        </motion.button>

        <ProviderStatus />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
        >
          <motion.div
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </motion.div>
        </motion.button>

        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-hover border border-border">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {user.full_name}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="p-2 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
