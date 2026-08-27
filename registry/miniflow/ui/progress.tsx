"use client";

import * as React from "react";
import { motion } from "motion/react";
import { draw, enter } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Progress indicators: a bar that eases toward its value, and a radial
 * whose ring draws along its own circumference around a focal number.
 */
export interface ProgressBarProps {
  value: number;
  label?: string;
  className?: string;
}

export function ProgressBar({ value, label = "Progress", className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cn(
        "relative h-1 w-56 overflow-hidden rounded-full bg-border-strong",
        className
      )}
    >
      <motion.span
        initial={false}
        animate={{ width: `${clamped}%` }}
        transition={enter}
        className="absolute inset-y-0 left-0 rounded-full bg-fg"
      />
    </div>
  );
}

export interface RadialProps {
  value: number;
  size?: number;
  label?: string;
  className?: string;
}

export function Radial({ value, size = 56, label = "Progress", className }: RadialProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const stroke = 3;
  const r = (48 - stroke) / 2;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-border-strong"
        />
        <motion.circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className="stroke-fg"
          initial={false}
          animate={{ pathLength: clamped / 100 }}
          transition={draw}
        />
      </svg>
      <span
        aria-hidden
        className="font-display text-emphasis font-bold text-text tabular-nums"
      >
        {Math.round(clamped)}
      </span>
    </div>
  );
}
