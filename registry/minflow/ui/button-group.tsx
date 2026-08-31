"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { durations, easeSoft, pressScale, useMotionEnabled } from "@/lib/motion";

/*
 * Actions that belong together, joined by behaviour instead of by a border.
 *
 * The usual button group welds outlined buttons into a segmented slab. This
 * one keeps every action a plain word and gives the set a single hover rail
 * that slides between them: the group is legible because one highlight is
 * shared, which is only possible if the actions really are one set.
 *
 * Reach for Segmented control instead when the buttons pick a value rather
 * than do a thing - a group of actions has no selected state to show.
 */
export interface ButtonGroupItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
}

export interface ButtonGroupProps {
  items: ButtonGroupItem[];
  /** Stacks vertically. Useful inside a narrow column. */
  orientation?: "horizontal" | "vertical";
  label?: string;
  className?: string;
}

export function ButtonGroup({
  items,
  orientation = "horizontal",
  label = "Actions",
  className,
}: ButtonGroupProps) {
  const motionOn = useMotionEnabled();
  const id = React.useId();
  const [near, setNear] = React.useState<string | null>(null);

  return (
    <div
      role="group"
      aria-label={label}
      onPointerLeave={() => setNear(null)}
      className={cn(
        "inline-flex",
        orientation === "vertical" ? "flex-col items-stretch" : "items-center",
        className
      )}
    >
      {items.map((item) => (
        <motion.button
          key={item.id}
          type="button"
          disabled={item.disabled}
          whileTap={motionOn && !item.disabled ? { scale: pressScale } : undefined}
          onPointerEnter={() => !item.disabled && setNear(item.id)}
          onFocus={() => !item.disabled && setNear(item.id)}
          onBlur={() => setNear(null)}
          onClick={item.onSelect}
          className={cn(
            "relative inline-flex h-8 items-center justify-center gap-1.5 rounded-control px-2.5 text-body font-medium outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0",
            near === item.id ? "text-text" : "text-text-2"
          )}
        >
          {near === item.id && (
            <motion.span
              aria-hidden
              layoutId={motionOn ? `${id}-rail` : undefined}
              transition={{ duration: durations.micro, ease: easeSoft }}
              className="absolute inset-0 -z-10 rounded-control bg-hover"
            />
          )}
          {item.icon}
          {item.label}
        </motion.button>
      ))}
    </div>
  );
}
