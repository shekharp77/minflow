"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cascade, fadeRise } from "@/lib/motion";

/*
 * Cascades its children in on mount. A client island wrapped around content
 * that is itself server-rendered, so the text is in the HTML either way and
 * the motion is pure enhancement.
 */
export function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={cascade()}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, (child, i) => (
        <motion.div key={i} variants={fadeRise}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
