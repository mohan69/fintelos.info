"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Radar,
  Users,
  Send,
  Zap,
  ArrowRight,
  Check,
} from "lucide-react";

interface WelcomeFlowProps {
  onComplete: () => void;
  userName?: string;
}

const STEPS = [
  {
    icon: Sparkles,
    title: "Welcome to Fintelos",
    description:
      "Your AI-native talent intelligence platform. Let's get you started with a quick tour of the key features.",
    color: "indigo",
  },
  {
    icon: Radar,
    title: "Autonomous Sourcing",
    description:
      "Describe your ideal candidate in natural language. Our AI searches across multiple sources, ranks candidates, and explains its reasoning.",
    color: "purple",
  },
  {
    icon: Users,
    title: "Candidate Intelligence",
    description:
      "Get AI-powered scoring, comparison, and insights for every candidate. Understand fit, stability, and response likelihood at a glance.",
    color: "emerald",
  },
  {
    icon: Send,
    title: "Smart Outreach",
    description:
      "Generate personalized outreach messages for email, LinkedIn, and WhatsApp. Our AI uses candidate intelligence and your preferences.",
    color: "amber",
  },
  {
    icon: Zap,
    title: "Workflow Automation",
    description:
      "Chain sourcing, ranking, and outreach into automated workflows. Get AI recommendations and track your recruiting productivity.",
    color: "rose",
  },
];

export function WelcomeFlow({ onComplete, userName }: WelcomeFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const colorClasses: Record<string, { bg: string; icon: string; glow: string }> = {
    indigo: { bg: "bg-indigo-500/10", icon: "text-indigo-400", glow: "shadow-indigo-500/20" },
    purple: { bg: "bg-purple-500/10", icon: "text-purple-400", glow: "shadow-purple-500/20" },
    emerald: { bg: "bg-emerald-500/10", icon: "text-emerald-400", glow: "shadow-emerald-500/20" },
    amber: { bg: "bg-amber-500/10", icon: "text-amber-400", glow: "shadow-amber-500/20" },
    rose: { bg: "bg-rose-500/10", icon: "text-rose-400", glow: "shadow-rose-500/20" },
  };

  const colors = colorClasses[step.color];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-lg mx-4"
      >
        <div className="rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-surface-hover">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={cn(
                    "inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-lg",
                    colors.bg,
                    colors.glow
                  )}
                >
                  <step.icon className={cn("w-8 h-8", colors.icon)} />
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-semibold text-foreground mb-3"
                >
                  {currentStep === 0 && userName
                    ? `Welcome, ${userName}`
                    : step.title}
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-sm text-muted leading-relaxed max-w-sm mx-auto"
                >
                  {step.description}
                </motion.p>
              </motion.div>
            </AnimatePresence>

            {/* Step indicators */}
            <div className="flex justify-center gap-2 mt-8 mb-6">
              {STEPS.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  whileHover={{ scale: 1.2 }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    i === currentStep
                      ? "w-6 bg-indigo-500"
                      : i < currentStep
                        ? "bg-indigo-500/50"
                        : "bg-surface-hover"
                  )}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={onComplete}
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                Skip tour
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-medium shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-shadow"
              >
                {isLast ? (
                  <>
                    Get Started
                    <Check className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
