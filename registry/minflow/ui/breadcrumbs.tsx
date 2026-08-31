"use client";

import * as React from "react";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { cascade, fadeSlide } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Breadcrumbs: the trail slides in left to right, one crumb after the next,
 * as if the path were being walked. Each crumb may carry a leading glyph,
 * which is what makes a deep trail scannable without reading it: the icons
 * are recognised before the words are.
 */
export interface Crumb {
  label: React.ReactNode;
  href?: string;
  /** Leading glyph for this crumb. */
  icon?: React.ReactNode;
}

export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <motion.ol
        variants={cascade(0.07)}
        initial="hidden"
        animate="visible"
        className="flex items-center gap-1"
      >
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <motion.li
              key={i}
              variants={fadeSlide(-6)}
              className="flex items-center gap-1"
            >
              {last ? (
                <span
                  aria-current="page"
                  className="flex items-center gap-1.5 text-body font-medium text-text [&_svg]:size-4 [&_svg]:text-fg"
                >
                  {item.icon}
                  {item.label}
                </span>
              ) : (
                <>
                  <a
                    href={item.href ?? "#"}
                    className={cn(
                      "flex min-h-6 items-center gap-1.5 rounded-control text-body text-text-2 outline-none transition-colors duration-150 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                      "[&_svg]:size-4 [&_svg]:text-fg-2 [&_svg]:transition-colors [&_svg]:duration-150 hover:[&_svg]:text-fg"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </a>
                  <ChevronRight aria-hidden className="size-4 text-fg-2/60" />
                </>
              )}
            </motion.li>
          );
        })}
      </motion.ol>
    </nav>
  );
}
