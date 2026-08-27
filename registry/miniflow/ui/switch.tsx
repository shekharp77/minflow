"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { durations, easeEnter, useMotionEnabled } from "@/lib/motion";

/*
 * From-scratch switch: a real button with role="switch", controlled or
 * uncontrolled. The on-state wears --fg, not the accent, so flipping a
 * setting never competes with the view's one accented action.
 */
export interface SwitchProps
  extends Omit<React.ComponentProps<"button">, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({
  checked,
  defaultChecked,
  onCheckedChange,
  className,
  disabled,
  onClick,
  ...props
}: SwitchProps) {
  const [internal, setInternal] = React.useState(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const on = isControlled ? checked : internal;
  const motionOk = useMotionEnabled();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      data-slot="switch"
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const next = !on;
        if (!isControlled) setInternal(next);
        onCheckedChange?.(next);
      }}
      className={cn(
        "relative inline-flex h-5 w-8 shrink-0 items-center rounded-full px-0.5 outline-none transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50",
        on ? "bg-fg" : "bg-border-strong",
        className
      )}
      {...props}
    >
      <motion.span
        aria-hidden
        animate={{ x: on ? 12 : 0 }}
        transition={
          motionOk
            ? { duration: durations.micro, ease: easeEnter }
            : { duration: 0 }
        }
        className="block size-4 rounded-full bg-bg shadow-sm ring-1 ring-border"
      />
    </button>
  );
}
