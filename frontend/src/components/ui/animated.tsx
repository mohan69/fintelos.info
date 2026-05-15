"use client";

import { motion, type MotionProps, type HTMLMotionProps } from "framer-motion";
import { forwardRef, type ReactNode } from "react";

// ============================================
// ANIMATION PRESETS
// ============================================

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
};

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
};

// Stagger container
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
};

// Spring animation
export const springConfig = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

// ============================================
// ANIMATED COMPONENTS
// ============================================

interface AnimatedDivProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
}

export const FadeIn = forwardRef<HTMLDivElement, AnimatedDivProps>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      exit={fadeIn.exit}
      transition={fadeIn.transition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
);
FadeIn.displayName = "FadeIn";

export const FadeInUp = forwardRef<HTMLDivElement, AnimatedDivProps>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      exit={fadeInUp.exit}
      transition={fadeInUp.transition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
);
FadeInUp.displayName = "FadeInUp";

export const FadeInDown = forwardRef<HTMLDivElement, AnimatedDivProps>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial={fadeInDown.initial}
      animate={fadeInDown.animate}
      exit={fadeInDown.exit}
      transition={fadeInDown.transition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
);
FadeInDown.displayName = "FadeInDown";

export const ScaleIn = forwardRef<HTMLDivElement, AnimatedDivProps>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial={scaleIn.initial}
      animate={scaleIn.animate}
      exit={scaleIn.exit}
      transition={scaleIn.transition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
);
ScaleIn.displayName = "ScaleIn";

export const SlideInRight = forwardRef<HTMLDivElement, AnimatedDivProps>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial={slideInRight.initial}
      animate={slideInRight.animate}
      exit={slideInRight.exit}
      transition={slideInRight.transition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
);
SlideInRight.displayName = "SlideInRight";

export const SlideInLeft = forwardRef<HTMLDivElement, AnimatedDivProps>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial={slideInLeft.initial}
      animate={slideInLeft.animate}
      exit={slideInLeft.exit}
      transition={slideInLeft.transition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
);
SlideInLeft.displayName = "SlideInLeft";

// Stagger list container
export const StaggerList = forwardRef<HTMLDivElement, AnimatedDivProps>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
);
StaggerList.displayName = "StaggerList";

// Stagger list item
export const StaggerItem = forwardRef<HTMLDivElement, AnimatedDivProps>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={staggerItem}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
);
StaggerItem.displayName = "StaggerItem";

// Animated counter for metrics
export function AnimatedCounter({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {value}
    </motion.span>
  );
}

// Animated progress bar
export function AnimatedProgress({
  value,
  className,
  color = "bg-indigo-500",
}: {
  value: number;
  className?: string;
  color?: string;
}) {
  return (
    <div className={className}>
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      />
    </div>
  );
}

// Typing indicator
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-zinc-400"
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Pulse dot for live status
export function PulseDot({ color = "bg-emerald-500" }: { color?: string }) {
  return (
    <span className="relative flex h-2 w-2">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
    </span>
  );
}

// Shimmer loading skeleton
export function Skeleton({
  className,
  count = 1,
}: {
  className?: string;
  count?: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton ${className}`} />
      ))}
    </>
  );
}
