"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { Tooltip } from "@/components/ui/tooltip";
import { enter } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Floating action button: the one unmissable action that hovers over
 * content. Rises a breath on hover, presses on tap.
 */
export interface FabProps extends HTMLMotionProps<"button"> {
  label: string;
}

export function Fab({ label, className, children, ...props }: FabProps) {
  return (
    <Tooltip label={label}>
      <motion.button
        type="button"
        aria-label={label}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.96 }}
        transition={enter}
        className={cn(
          "flex size-12 items-center justify-center rounded-full bg-fg text-bg shadow-overlay outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&_svg]:size-5",
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    </Tooltip>
  );
}
