"use client";

import * as React from "react";
import { motion } from "motion/react";
import { draw } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Real input for forms and assistive tech; the visible box is drawn. The
 * check does not appear, it draws itself: an SVG stroke animated along its
 * own path length.
 */
export interface CheckboxProps
  extends Omit<React.ComponentProps<"input">, "type" | "size"> {
  label?: React.ReactNode;
}

export function Checkbox({
  label,
  className,
  checked,
  defaultChecked,
  onChange,
  disabled,
  ...props
}: CheckboxProps) {
  const [internal, setInternal] = React.useState(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const on = isControlled ? !!checked : internal;

  return (
    <label
      className={cn(
        "inline-flex cursor-pointer select-none items-center gap-2.5 text-body text-text",
        disabled && "cursor-default opacity-50",
        className
      )}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={on}
        disabled={disabled}
        onChange={(event) => {
          if (!isControlled) setInternal(event.target.checked);
          onChange?.(event);
        }}
        {...props}
      />
      <span
        aria-hidden
        className={cn(
          "flex size-4.5 shrink-0 items-center justify-center rounded-control border transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
          on ? "border-fg bg-fg" : "border-border-strong bg-transparent"
        )}
      >
        <motion.svg
          viewBox="0 0 16 16"
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3 stroke-bg"
        >
          <motion.path
            d="M3.5 8.5 6.5 11.5 12.5 4.5"
            initial={false}
            animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
            transition={draw}
          />
        </motion.svg>
      </span>
      {label}
    </label>
  );
}
