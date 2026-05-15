"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Search,
  Users,
  Workflow,
  Brain,
  Radar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Chat", icon: MessageSquare },
  { href: "/sourcing", label: "Sourcing", icon: Radar },
  { href: "/search", label: "Search", icon: Search },
  { href: "/candidates", label: "Candidates", icon: Users },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/memory", label: "Memory", icon: Brain },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col border-r border-border bg-surface overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-border h-14">
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <Sparkles className="w-6 h-6 text-indigo-500 shrink-0" />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="text-lg font-semibold gradient-text whitespace-nowrap"
            >
              Fintelos
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group",
                isActive
                  ? "text-indigo-400"
                  : "text-muted hover:text-foreground"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-indigo-500/10 border border-indigo-500/20 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              {/* Hover indicator */}
              {!isActive && (
                <div className="absolute inset-0 bg-surface-hover rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              )}

              <Icon className={cn("w-5 h-5 shrink-0 relative z-10", isActive && "text-indigo-400")} />

              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.15 }}
                    className="relative z-10 whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-border">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full p-2.5 rounded-xl text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.div>
        </motion.button>
      </div>
    </motion.aside>
  );
}
