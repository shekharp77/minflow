"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { enter, exit as exitT, springSnap } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Range control drawn from scratch: full keyboard support on the thumb, and
 * while dragging, the thumb grows slightly and a value bubble rises above
 * it, so the number is present exactly when it matters.
 */
export interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  label?: string;
  className?: string;
}

export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onValueChange,
  label = "Value",
  className,
}: SliderProps) {
  const [internal, setInternal] = React.useState(defaultValue ?? min);
  const isControlled = value !== undefined;
  const val = isControlled ? value : internal;
  const [active, setActive] = React.useState(false);
  const trackRef = React.useRef<HTMLDivElement>(null);

  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const commit = (n: number) => {
    const stepped = clamp(Math.round(n / step) * step);
    if (!isControlled) setInternal(stepped);
    onValueChange?.(stepped);
  };
  const fromClientX = (x: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    commit(min + ((x - rect.left) / rect.width) * (max - min));
  };

  const pct = ((val - min) / (max - min)) * 100;

  return (
    <div
      ref={trackRef}
      className={cn(
        "relative flex h-10 w-56 cursor-pointer touch-none select-none items-center",
        className
      )}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        setActive(true);
        fromClientX(event.clientX);
      }}
      onPointerMove={(event) => {
        if (active) fromClientX(event.clientX);
      }}
      onPointerUp={() => setActive(false)}
      onPointerCancel={() => setActive(false)}
    >
      <span aria-hidden className="h-1 w-full rounded-full bg-border-strong" />
      <span
        aria-hidden
        style={{ width: `${pct}%` }}
        className="absolute h-1 rounded-full bg-fg"
      />
      <motion.span
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={val}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowUp") {
            event.preventDefault();
            commit(val + step);
          } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
            event.preventDefault();
            commit(val - step);
          } else if (event.key === "Home") {
            commit(min);
          } else if (event.key === "End") {
            commit(max);
          }
        }}
        /*
         * The thumb is under the reader's finger while this plays, so it runs
         * on a spring at press speed. A 240ms tween here reads as the control
         * lagging the hand -- the one thing a drag handle may never do.
         */
        animate={{ scale: active ? 1.25 : 1 }}
        transition={springSnap}
        style={{ left: `${pct}%` }}
        className="hit-target absolute size-3.5 -translate-x-1/2 rounded-full bg-fg outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
      <AnimatePresence>
        {active && (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97, transition: exitT }}
            transition={enter}
            style={{ left: `${pct}%` }}
            className="pointer-events-none absolute -top-5 -translate-x-1/2 rounded-overlay bg-fg px-1.5 py-0.5 text-caption font-medium text-bg"
          >
            {val}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
