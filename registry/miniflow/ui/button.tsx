"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";
import { durations, pressScale, useMotionEnabled } from "@/lib/motion";

/*
 * Variant ramp, ranked by restraint: `text` is the default for any labeled
 * action, `ghost` earns a hover fill, `outline` and `solid` are last resorts
 * for a truly unmissable commit. `accent` marks the view's single primary
 * action; two accented elements on one view means neither is primary.
 */
const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-control font-sans font-medium outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        text: "text-text-2 hover:text-text",
        ghost: "text-text-2 hover:bg-hover hover:text-text",
        outline: "border border-border-strong text-text hover:bg-hover",
        solid: "bg-fg text-bg hover:opacity-90",
      },
      size: {
        sm: "h-7 px-2 text-caption [&_svg]:size-4",
        md: "h-8 px-2.5 text-body [&_svg]:size-4",
        lg: "h-9 px-3 text-emphasis [&_svg]:size-5",
      },
      accent: {
        true: "",
      },
    },
    compoundVariants: [
      { variant: "text", accent: true, class: "text-accent hover:text-accent hover:opacity-80" },
      { variant: "ghost", accent: true, class: "text-accent hover:text-accent" },
      { variant: "outline", accent: true, class: "border-accent/40 text-accent hover:text-accent" },
      { variant: "solid", accent: true, class: "bg-accent text-on-accent" },
    ],
    defaultVariants: {
      variant: "text",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children">,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  children?: React.ReactNode;
}

export function Button({
  className,
  variant,
  size,
  accent,
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const motionOk = useMotionEnabled();

  return (
    <motion.button
      data-slot="button"
      whileTap={motionOk && !disabled && !loading ? { scale: pressScale } : undefined}
      transition={{ duration: durations.press, ease: "easeOut" }}
      className={cn(buttonVariants({ variant, size, accent }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <LoaderCircle aria-hidden className="animate-spin" /> : null}
      {children}
    </motion.button>
  );
}
