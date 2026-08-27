"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { roll } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Crossfades a glyph between states so state changes never hard-cut:
 * key the current state with `id` and render the matching icon as children.
 */
export interface IconSwapProps {
  id: string;
  className?: string;
  children: React.ReactNode;
}

export function IconSwap({ id, className, children }: IconSwapProps) {
  return (
    <span
      data-slot="icon-swap"
      className={cn("relative inline-flex items-center justify-center", className)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={id}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={roll}
          className="inline-flex"
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
