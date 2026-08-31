"use client";

import * as React from "react";
import { motion } from "motion/react";
import { morph, pressScale, useMotionEnabled } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Segmented control: the radio alternative for quick options outside forms.
 * One shared thumb slides between segments (layout animation), so switching
 * reads as movement, not replacement.
 */
export interface SegmentedOption {
  value: string;
  label: React.ReactNode;
}

export interface SegmentedProps {
  options: SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  className?: string;
}

export function Segmented({
  options,
  value,
  defaultValue,
  onValueChange,
  label,
  className,
}: SegmentedProps) {
  const [internal, setInternal] = React.useState(
    defaultValue ?? options[0]?.value
  );
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;
  const id = React.useId();
  const motionOk = useMotionEnabled();

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-control bg-bg-2 p-0.5",
        className
      )}
    >
      {options.map((option) => {
        const active = option.value === current;
        return (
          <motion.button
            key={option.value}
            type="button"
            role="radio"
            whileTap={motionOk ? { scale: pressScale } : undefined}
            aria-checked={active}
            onClick={() => {
              if (!isControlled) setInternal(option.value);
              onValueChange?.(option.value);
            }}
            className={cn(
              "relative h-7 rounded-control px-2.5 text-body font-medium outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              active ? "text-text" : "text-text-2 hover:text-text"
            )}
          >
            {active && (
              <motion.span
                layoutId={`${id}-thumb`}
                transition={morph}
                className="absolute inset-0 rounded-control bg-bg shadow-sm ring-1 ring-border"
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
