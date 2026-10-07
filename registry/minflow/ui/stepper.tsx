"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { enter } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Input stepper: the number rolls vertically in the direction of change,
 * like a counter drum, instead of blinking to a new value.
 */
export interface StepperProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Form field name. When set, a hidden input submits the current value. */
  name?: string;
  label?: string;
  className?: string;
}

export function Stepper({
  min = 0,
  max = 99,
  step = 1,
  value,
  defaultValue,
  onValueChange,
  name,
  label = "Quantity",
  className,
}: StepperProps) {
  const [internal, setInternal] = React.useState(defaultValue ?? min);
  const isControlled = value !== undefined;
  const val = isControlled ? value : internal;
  const direction = React.useRef(1);

  const commit = (n: number) => {
    const clamped = Math.min(max, Math.max(min, n));
    direction.current = clamped >= val ? 1 : -1;
    if (!isControlled) setInternal(clamped);
    onValueChange?.(clamped);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    commit(e.key === "ArrowUp" ? val + step : val - step);
  };

  return (
    <div
      role="group"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn("inline-flex items-center gap-1", className)}
    >
      <IconButton
        label="Decrease"
        type="button"
        disabled={val <= min}
        onClick={() => commit(val - step)}
        className="relative size-8 after:absolute after:-inset-1"
      >
        <Minus />
      </IconButton>
      <span
        aria-live="polite"
        className="relative flex h-6 w-8 items-center justify-center overflow-hidden text-body font-medium text-text"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={val}
            initial={{ y: direction.current * 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: direction.current * -14, opacity: 0 }}
            transition={enter}
          >
            {val}
          </motion.span>
        </AnimatePresence>
      </span>
      <IconButton
        label="Increase"
        type="button"
        disabled={val >= max}
        onClick={() => commit(val + step)}
        className="relative size-8 after:absolute after:-inset-1"
      >
        <Plus />
      </IconButton>
      {name ? <input type="hidden" name={name} value={val} /> : null}
    </div>
  );
}
