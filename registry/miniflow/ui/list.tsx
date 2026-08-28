"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { cascade, fadeRise, useMotionEnabled } from "@/lib/motion";

/*
 * A vertical run of records: inbox rows, settings, search results.
 *
 * There are no rules between the rows. Separation comes from the leading
 * column lining up and from the space each row is given, which is enough for
 * the eye and leaves the page quiet. The hover fill is the only chrome, and it
 * only exists on rows that actually do something when pressed.
 */
export interface ListItemData {
  id: string;
  title: string;
  /** One supporting line under the title. */
  detail?: string;
  /** Icon or avatar. */
  leading?: React.ReactNode;
  /** Meta, count, or an action. */
  trailing?: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
}

export interface ListProps {
  items: ListItemData[];
  /** Tightens the row height for long, glanceable lists. */
  dense?: boolean;
  /** Marks one row as chosen. */
  selectedId?: string;
  label?: string;
  className?: string;
}

export function List({
  items,
  dense = false,
  selectedId,
  label = "List",
  className,
}: ListProps) {
  const motionOn = useMotionEnabled();

  return (
    <motion.ul
      aria-label={label}
      variants={cascade(0.05)}
      initial={motionOn ? "hidden" : false}
      animate="visible"
      transition={motionOn ? undefined : { duration: 0 }}
      className={cn("flex w-full list-none flex-col", className)}
    >
      {items.map((item) => {
        const interactive = Boolean(item.onSelect) && !item.disabled;
        const selected = item.id === selectedId;
        const Row = interactive ? "button" : "div";

        return (
          <motion.li key={item.id} variants={fadeRise}>
            <Row
              {...(interactive
                ? { type: "button" as const, onClick: item.onSelect }
                : {})}
              aria-current={selected ? "true" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-control px-2 text-left outline-none transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                dense ? "py-1.5" : "py-2.5",
                interactive && "hover:bg-hover",
                selected && "bg-bg-2",
                item.disabled && "opacity-40"
              )}
            >
              {item.leading ? (
                <span className="flex shrink-0 items-center text-fg-2 [&_svg]:size-4 [&_svg]:shrink-0">
                  {item.leading}
                </span>
              ) : null}
              <span className="flex min-w-0 flex-1 flex-col">
                <span
                  className={cn(
                    "truncate text-body",
                    selected ? "font-medium text-text" : "text-text"
                  )}
                >
                  {item.title}
                </span>
                {item.detail ? (
                  <span className="truncate text-caption text-text-2">
                    {item.detail}
                  </span>
                ) : null}
              </span>
              {item.trailing ? (
                <span className="shrink-0 text-caption text-text-2">
                  {item.trailing}
                </span>
              ) : null}
            </Row>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
