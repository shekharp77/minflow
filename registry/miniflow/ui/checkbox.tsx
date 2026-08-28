"use client";

import * as React from "react";
import { motion } from "motion/react";
import { draw, exit as exitT, springSnap, useMotionEnabled } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Real input for forms and assistive tech; the visible box is drawn. The
 * check does not appear, it draws itself: an SVG stroke animated along its
 * own path length.
 *
 * Checking and unchecking are not symmetric. Checking is a small event worth
 * showing -- the box fills, the stroke travels, the whole thing lands on a
 * spring. Unchecking is a correction, and a correction should be over before
 * the reader has finished deciding it was one, so the tick simply leaves.
 *
 * The fill and the stroke share one duration on purpose. They used to differ
 * by 350ms, which read as two separate events: a box that filled, and then,
 * later, a tick that arrived in it.
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
  const motionOk = useMotionEnabled();

  return (
    <label
      className={cn(
        "group/cb inline-flex cursor-pointer select-none items-center gap-2.5 text-body text-text",
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
      <motion.span
        aria-hidden
        /*
         * The box lands on the same spring as the tick draws, so the two read
         * as one event. `whileTap` sits on the label's own gesture, which is
         * why the press is wired through the group rather than the input.
         */
        animate={{ scale: 1 }}
        whileTap={motionOk && !disabled ? { scale: 0.9 } : undefined}
        transition={springSnap}
        className={cn(
          "flex size-4.5 shrink-0 items-center justify-center rounded-control border transition-colors duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
          on ? "border-fg bg-fg" : "border-control-edge bg-transparent"
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
            /*
             * Drawing on the way in, leaving on the way out. Un-drawing a
             * stroke in reverse looks like the interface undoing itself in
             * front of the reader, which is far more motion than a correction
             * deserves.
             */
            transition={on ? draw : { ...exitT, pathLength: { duration: 0 } }}
          />
        </motion.svg>
      </motion.span>
      {label}
    </label>
  );
}
