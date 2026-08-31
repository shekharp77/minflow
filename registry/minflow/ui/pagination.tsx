"use client";

import * as React from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import { durations, easeSoft, pressScaleSmall, useMotionEnabled } from "@/lib/motion";

/*
 * Page navigation as a row of numbers with one travelling marker.
 *
 * The marker is a single shared element that slides between pages rather than
 * a highlight that switches off here and on there, so the eye is carried to
 * the new page instead of having to find it. Gaps are a character, not a
 * button: there is nothing to click in the middle of a jump.
 */
export interface PaginationProps {
  page: number;
  count: number;
  onChange?: (page: number) => void;
  /** Pages either side of the current one before the list elides. */
  siblings?: number;
  className?: string;
}

type Slot = number | "gap-left" | "gap-right";

function slotsFor(page: number, count: number, siblings: number): Slot[] {
  /* Short lists are never elided: hiding two of seven pages helps nobody. */
  if (count <= siblings * 2 + 5) {
    return Array.from({ length: count }, (_, i) => i + 1);
  }
  const left = Math.max(2, page - siblings);
  const right = Math.min(count - 1, page + siblings);
  const out: Slot[] = [1];
  if (left > 2) out.push("gap-left");
  for (let i = left; i <= right; i++) out.push(i);
  if (right < count - 1) out.push("gap-right");
  out.push(count);
  return out;
}

export function Pagination({
  page,
  count,
  onChange,
  siblings = 1,
  className,
}: PaginationProps) {
  const motionOn = useMotionEnabled();
  const id = React.useId();
  const slots = slotsFor(page, count, siblings);

  const go = (next: number) => {
    const clamped = Math.max(1, Math.min(count, next));
    if (clamped !== page) onChange?.(clamped);
  };

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center gap-0.5", className)}
    >
      <IconButton
        label="Previous page"
        className="size-8"
        disabled={page <= 1}
        onClick={() => go(page - 1)}
      >
        <ChevronLeft />
      </IconButton>

      {slots.map((slot) =>
        typeof slot === "number" ? (
          <motion.button
            key={slot}
            type="button"
            aria-label={`Page ${slot}`}
            whileTap={motionOn ? { scale: pressScaleSmall } : undefined}
            aria-current={slot === page ? "page" : undefined}
            onClick={() => go(slot)}
            className={cn(
              "relative inline-flex size-8 items-center justify-center rounded-control text-body tabular-nums outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              slot === page
                ? "font-medium text-text"
                : "text-text-2 hover:bg-hover hover:text-text"
            )}
          >
            {slot === page && (
              <motion.span
                aria-hidden
                layoutId={motionOn ? `${id}-marker` : undefined}
                transition={{ duration: durations.micro, ease: easeSoft }}
                className="absolute inset-0 -z-10 rounded-control bg-bg-2"
              />
            )}
            {slot}
          </motion.button>
        ) : (
          <span
            key={slot}
            aria-hidden
            className="inline-flex size-8 items-center justify-center text-body text-fg-2"
          >
            &hellip;
          </span>
        )
      )}

      <IconButton
        label="Next page"
        className="size-8"
        disabled={page >= count}
        onClick={() => go(page + 1)}
      >
        <ChevronRight />
      </IconButton>
    </nav>
  );
}
