"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { morph, roll } from "@/lib/motion";
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

  return (
    <div className={cn("flex w-full flex-col", className)}>
      {items.map((item) => {
        const expanded = open === item.id;
        const listStyle = item.icon != null;
        return (
          <div key={item.id}>
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setOpen(expanded ? null : item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-control text-left text-body font-medium text-text outline-none transition-colors duration-200 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
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
            </button>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={morph}
                  className="overflow-hidden"
                >
                  <div
                    className={cn(
                      "max-w-[52ch] pb-4 text-body text-text-2",
                      item.icon != null && "pl-11"
                    )}
                  >
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
