"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { enter } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Badge: an item count riding an icon's shoulder. Count changes pop the
 * pill in fresh; reaching zero collapses it away. Numbers, never bare
 * meaning-carrying dots.
 */
export interface BadgeProps {
  count: number;
  max?: number;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ count, max = 99, className, children }: BadgeProps) {
  const display = count > max ? `${max}+` : String(count);

  return (
    <span className={cn("relative inline-flex", className)}>
      {children}
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={display}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={enter}
            className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-fg px-1 text-caption font-medium leading-none text-bg tabular-nums"
          >
            {display}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
