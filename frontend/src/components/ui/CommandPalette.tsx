"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Search,
  MessageSquare,
  Radar,
  Users,
  Workflow,
  Brain,
  Zap,
  ArrowRight,
  Command,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: typeof Search;
  action: () => void;
  category: string;
  shortcut?: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const commands: CommandItem[] = [
    {
      id: "chat",
      label: "New Chat",
      description: "Start a new conversation with AI",
      icon: MessageSquare,
      action: () => { router.push("/"); setIsOpen(false); },
      category: "Navigation",
      shortcut: "⌘1",
    },
    {
      id: "sourcing",
      label: "Sourcing",
      description: "Find candidates across multiple sources",
      icon: Radar,
      action: () => { router.push("/sourcing"); setIsOpen(false); },
      category: "Navigation",
      shortcut: "⌘2",
    },
    {
      id: "candidates",
      label: "Candidates",
      description: "View and manage your candidate pool",
      icon: Users,
      action: () => { router.push("/candidates"); setIsOpen(false); },
      category: "Navigation",
      shortcut: "⌘3",
    },
    {
      id: "workflows",
      label: "Workflows",
      description: "Manage recruiting workflows",
      icon: Workflow,
      action: () => { router.push("/workflows"); setIsOpen(false); },
      category: "Navigation",
      shortcut: "⌘4",
    },
    {
      id: "memory",
      label: "Memory",
      description: "View AI memory and preferences",
      icon: Brain,
      action: () => { router.push("/memory"); setIsOpen(false); },
      category: "Navigation",
    },
    {
      id: "source-java",
      label: "Source Java Architects",
      description: "Find Java architects in Bangalore",
      icon: Zap,
      action: () => { router.push("/sourcing"); setIsOpen(false); },
      category: "Quick Actions",
    },
    {
      id: "source-python",
      label: "Source Python Developers",
      description: "Find senior Python developers",
      icon: Zap,
      action: () => { router.push("/sourcing"); setIsOpen(false); },
      category: "Quick Actions",
    },
    {
      id: "source-react",
      label: "Source React Engineers",
      description: "Find React engineers with 5+ years",
      icon: Zap,
      action: () => { router.push("/sourcing"); setIsOpen(false); },
      category: "Quick Actions",
    },
  ];

  const filtered = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  // Group by category
  const grouped = filtered.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = [];
      acc[cmd.category].push(cmd);
      return acc;
    },
    {} as Record<string, CommandItem[]>
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Open with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filtered[selectedIndex]) {
            filtered[selectedIndex].action();
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    },
    [isOpen, filtered, selectedIndex]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

          {/* Palette */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-lg mx-4 rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
              <Search className="w-5 h-5 text-muted" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-muted/50"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] text-muted/50 border border-border rounded-md">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[300px] overflow-y-auto p-2">
              {Object.entries(grouped).length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted">
                  No results found
                </div>
              ) : (
                Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <p className="px-3 py-1.5 text-[10px] font-medium text-muted/60 uppercase tracking-wider">
                      {category}
                    </p>
                    {items.map((item) => {
                      const globalIndex = filtered.indexOf(item);
                      const isSelected = globalIndex === selectedIndex;

                      return (
                        <motion.button
                          key={item.id}
                          initial={false}
                          animate={{
                            backgroundColor: isSelected
                              ? "rgba(99, 102, 241, 0.1)"
                              : "transparent",
                          }}
                          onClick={item.action}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-colors"
                        >
                          <item.icon
                            className={cn(
                              "w-4 h-4",
                              isSelected ? "text-indigo-400" : "text-muted"
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-sm font-medium truncate",
                                isSelected ? "text-foreground" : "text-foreground/80"
                              )}
                            >
                              {item.label}
                            </p>
                            <p className="text-xs text-muted/60 truncate">
                              {item.description}
                            </p>
                          </div>
                          {item.shortcut && (
                            <kbd className="text-[10px] text-muted/40 px-1.5 py-0.5 border border-border rounded">
                              {item.shortcut}
                            </kbd>
                          )}
                          {isSelected && (
                            <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-surface-hover/50">
              <div className="flex items-center gap-3 text-[10px] text-muted/40">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 border border-border rounded">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 border border-border rounded">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 border border-border rounded">esc</kbd>
                  Close
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
