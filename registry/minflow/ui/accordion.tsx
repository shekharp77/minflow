"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { enter, exit as exitT, morph, pressScale, roll, useMotionEnabled } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Accordion: rows expand in place; height eases open while the chevron
 * rolls over. Separation is whitespace, never rules. Rows with an `icon`
 * render as a list of tiles with a trailing chevron that rolls 90 degrees.
 */
export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  /** Leading glyph; switches the row into list style. */
  icon?: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: string;
  className?: string;
}

export function Accordion({ items, defaultOpen, className }: AccordionProps) {
  const [open, setOpen] = React.useState<string | null>(defaultOpen ?? null);
  const motionOk = useMotionEnabled();

  return (
    <div className={cn("flex w-full flex-col", className)}>
      {items.map((item) => {
        const expanded = open === item.id;
        const listStyle = item.icon != null;
        return (
          <div key={item.id}>
            <motion.button
              type="button"
              aria-expanded={expanded}
              whileTap={motionOk ? { scale: pressScale } : undefined}
              onClick={() => setOpen(expanded ? null : item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-control text-left text-body font-medium text-text outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
                listStyle ? "h-12" : "h-10 justify-between gap-4"
              )}
            >
              {listStyle && (
                <span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center rounded-control bg-bg-2 text-fg [&_svg]:size-4"
                >
                  {item.icon}
                </span>
              )}
              {item.title}
              <motion.span
                aria-hidden
                animate={
                  listStyle
                    ? { rotate: expanded ? 90 : 0 }
                    : { rotate: expanded ? 180 : 0 }
                }
                transition={roll}
                className={cn("text-fg-2", listStyle && "ml-auto")}
              >
                {listStyle ? (
                  <ChevronRight className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </motion.span>
            </motion.button>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  /*
                   * The box opens and the words arrive behind it, rather than
                   * the whole block fading up as one sheet. Splitting the two
                   * is what stops a reveal reading as a rectangle that grew:
                   * the height explains the space, the content explains what
                   * is now in it.
                   *
                   * Opacity is deliberately quicker than the height and rides
                   * on the child, so text is legible well before the box has
                   * finished settling.
                   */
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={morph}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0, transition: { ...enter, delay: 0.04 } }}
                    exit={{ opacity: 0, transition: exitT }}
                    className={cn(
                      "max-w-[52ch] pb-4 text-body text-text-2",
                      item.icon != null && "pl-11"
                    )}
                  >
                    {item.content}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
