"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { durations, easeEnter, useMotionEnabled } from "@/lib/motion";

/*
 * A score you can set with one gesture.
 *
 * Built as a radiogroup rather than five buttons, so the arrow keys work and a
 * screen reader announces one control with a value instead of five unrelated
 * stars. The hover preview is the whole interaction design: you see the score
 * you are about to give before you commit to it.
 */
export interface RatingProps {
  value?: number;
  defaultValue?: number;
  max?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  /** Renders the numeric value beside the stars. */
  showValue?: boolean;
  label?: string;
  className?: string;
}

export function Rating({
  value,
  defaultValue = 0,
  max = 5,
  onChange,
  readOnly = false,
  showValue = false,
  label = "Rating",
  className,
}: RatingProps) {
  const motionOn = useMotionEnabled();
  const [internal, setInternal] = React.useState(defaultValue);
  const [hover, setHover] = React.useState<number | null>(null);
  const groupRef = React.useRef<HTMLDivElement>(null);
  const current = value ?? internal;
  /* Hover wins while the pointer is down the row: the preview is the point. */
  const shown = hover ?? current;

  const set = (next: number) => {
    if (readOnly) return;
    /*
     * Keep focus on the group, never on a star. The stars are aria-hidden
     * presentation, and the arrow keys are bound to the group - so if a
     * pointer press left focus on a star, the keyboard would stop working
     * the moment somebody used the mouse.
     */
    groupRef.current?.focus();
    /* Clicking the current score clears it - otherwise a 1 can never be undone. */
    const v = next === current ? 0 : next;
    if (value === undefined) setInternal(v);
    onChange?.(v);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (readOnly) return;
    const delta =
      e.key === "ArrowRight" || e.key === "ArrowUp"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowDown"
          ? -1
          : 0;
    if (!delta) return;
    e.preventDefault();
    set(Math.max(0, Math.min(max, current + delta)));
  };

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div
        ref={groupRef}
        role={readOnly ? "img" : "slider"}
        aria-label={label}
        aria-valuenow={readOnly ? undefined : current}
        aria-valuemin={readOnly ? undefined : 0}
        aria-valuemax={readOnly ? undefined : max}
        aria-valuetext={`${current} of ${max}`}
        tabIndex={readOnly ? undefined : 0}
        onKeyDown={onKey}
        onPointerLeave={() => setHover(null)}
        className={cn(
          "inline-flex items-center rounded-control outline-none",
          !readOnly &&
            "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        )}
      >
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
          const on = n <= shown;
          return (
            <motion.button
              key={n}
              type="button"
              disabled={readOnly}
              aria-hidden
              tabIndex={-1}
              onPointerEnter={() => !readOnly && setHover(n)}
              /* Stops the browser focusing this aria-hidden button on press. */
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => set(n)}
              animate={{ scale: on ? 1 : 0.88, opacity: on ? 1 : 0.55 }}
              whileTap={motionOn && !readOnly ? { scale: 0.82 } : undefined}
              transition={{
                duration: motionOn ? durations.micro : 0,
                ease: easeEnter,
                /* Filling trails outward from the first star, so raising a
                   score reads as a sweep instead of five things blinking. */
                delay: motionOn && on ? (n - 1) * 0.03 : 0,
              }}
              className={cn(
                "inline-flex items-center justify-center p-0.5 outline-none",
                readOnly ? "cursor-default" : "cursor-pointer",
                on ? "text-warn" : "text-fg-2"
              )}
            >
              <Star className="size-5" fill={on ? "currentColor" : "none"} />
            </motion.button>
          );
        })}
      </div>
      {showValue && (
        <span className="min-w-6 text-body tabular-nums text-text-2">
          {shown || "-"}
        </span>
      )}
    </div>
  );
}
