"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { durations, useMotionEnabled } from "@/lib/motion";

/*
 * Icon-only control: the default for toolbar, repeated, and row actions.
 * 40px hit target no matter the glyph size, a mandatory accessible name,
 * and a tooltip that hands the stripped label back to sighted users.
 */
export interface IconButtonProps extends HTMLMotionProps<"button"> {
  /** Accessible name; also shown as the tooltip. */
  label: string;
  /** Marks the view's single primary action. */
  accent?: boolean;
  size?: 16 | 20 | 24;
}

const glyph = {
  16: "[&_svg]:size-4",
  20: "[&_svg]:size-5",
  24: "[&_svg]:size-6",
} as const;

export function IconButton({
  label,
  accent,
  size = 16,
  className,
  disabled,
  ...props
}: IconButtonProps) {
  const motionOk = useMotionEnabled();

  return (
    <Tooltip label={label}>
      <motion.button
        data-slot="icon-button"
        aria-label={label}
        whileTap={motionOk && !disabled ? { scale: 0.94 } : undefined}
        transition={{ duration: durations.press, ease: "easeOut" }}
        disabled={disabled}
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-control text-fg-2 outline-none transition-colors duration-200 hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
          glyph[size],
          accent && "text-accent hover:text-accent",
          className
        )}
        {...props}
      />
    </Tooltip>
  );
}
