"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import { durations, easeEnter, easeSoft, useMotionEnabled } from "@/lib/motion";

/*
 * Two lists and the traffic between them: choose from everything available,
 * end up with a set.
 *
 * The animation is the explanation. An item that moves is the same element in
 * a new list rather than one disappearing and another appearing, so nobody has
 * to re-find what they just moved. Counts sit in the headings because the
 * question this control answers is usually "how many have I picked".
 */
export interface TransferItem {
  id: string;
  label: string;
}

export interface TransferListProps {
  items: TransferItem[];
  /** Ids that start on the chosen side. */
  defaultSelected?: string[];
  onChange?: (selectedIds: string[]) => void;
  sourceLabel?: string;
  targetLabel?: string;
  className?: string;
}

export function TransferList({
  items,
  defaultSelected = [],
  onChange,
  sourceLabel = "Available",
  targetLabel = "Selected",
  className,
}: TransferListProps) {
  const motionOn = useMotionEnabled();
  const [chosen, setChosen] = React.useState<string[]>(defaultSelected);
  /* Ticked-but-not-yet-moved. Separate from `chosen` so a mis-tick is free. */
  const [marked, setMarked] = React.useState<string[]>([]);

  const left = items.filter((i) => !chosen.includes(i.id));
  const right = items.filter((i) => chosen.includes(i.id));

  const commit = (next: string[]) => {
    setChosen(next);
    setMarked([]);
    onChange?.(next);
  };

  const move = (toTarget: boolean) => {
    const pool = (toTarget ? left : right).map((i) => i.id);
    const moving = marked.filter((id) => pool.includes(id));
    if (moving.length === 0) return;
    commit(
      toTarget
        ? [...chosen, ...moving]
        : chosen.filter((id) => !moving.includes(id))
    );
  };

  const markedInLeft = marked.some((id) => left.some((i) => i.id === id));
  const markedInRight = marked.some((id) => right.some((i) => i.id === id));

  return (
    <div
      className={cn(
        "flex w-full max-w-xl flex-col items-stretch gap-3 sm:flex-row sm:items-center",
        className
      )}
    >
      <TransferColumn
        label={sourceLabel}
        items={left}
        marked={marked}
        onToggle={(id) =>
          setMarked((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]))
        }
      />

      {/* Controls rotate a quarter turn on narrow screens, because the lists
          stack there and "right" stops meaning anything. */}
      <div className="flex shrink-0 flex-row items-center justify-center gap-1 sm:flex-col">
        <IconButton
          label={`Move to ${targetLabel}`}
          disabled={!markedInLeft}
          onClick={() => move(true)}
          className="size-9 rotate-90 sm:rotate-0"
        >
          <ChevronRight />
        </IconButton>
        <IconButton
          label={`Move to ${sourceLabel}`}
          disabled={!markedInRight}
          onClick={() => move(false)}
          className="size-9 rotate-90 sm:rotate-0"
        >
          <ChevronLeft />
        </IconButton>
      </div>

      <TransferColumn
        label={targetLabel}
        items={right}
        marked={marked}
        onToggle={(id) =>
          setMarked((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]))
        }
        empty="Nothing selected yet"
      />
    </div>
  );
}

function TransferColumn({
  label,
  items: rows,
  marked: ticked,
  onToggle,
  empty = "Empty",
}: {
  label: string;
  items: TransferItem[];
  marked: string[];
  onToggle: (id: string) => void;
  empty?: string;
}) {
  const motionOn = useMotionEnabled();

  return (
    <div className="min-w-0 flex-1">
      <p className="px-2 pb-1 text-caption font-medium uppercase tracking-[0.08em] text-text-2">
        {label}
        <span className="ml-1.5 tabular-nums font-normal normal-case tracking-normal text-fg-2">
          {rows.length}
        </span>
      </p>
      <ul className="flex min-h-32 list-none flex-col rounded-control bg-bg-2 p-1">
        <AnimatePresence initial={false} mode="popLayout">
          {rows.length === 0 ? (
            <motion.li
              key="empty"
              initial={motionOn ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              exit={motionOn ? { opacity: 0 } : undefined}
              className="px-2 py-2 text-caption text-text-2"
            >
              {empty}
            </motion.li>
          ) : (
            rows.map((item) => (
              <motion.li
                key={item.id}
                layout={motionOn ? true : false}
                initial={motionOn ? { opacity: 0, scale: 0.96 } : false}
                animate={{ opacity: 1, scale: 1 }}
                exit={motionOn ? { opacity: 0, scale: 0.96 } : undefined}
                transition={{ duration: durations.micro, ease: easeSoft }}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={ticked.includes(item.id)}
                  onClick={() => onToggle(item.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-control px-2 py-1.5 text-left text-body outline-none transition-colors duration-150 hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    ticked.includes(item.id) ? "text-text" : "text-text-2"
                  )}
                >
                  <motion.span
                    aria-hidden
                    animate={{
                      scale: ticked.includes(item.id) ? 1 : 0.7,
                      opacity: ticked.includes(item.id) ? 1 : 0.45,
                    }}
                    transition={{ duration: motionOn ? durations.press : 0, ease: easeEnter }}
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      ticked.includes(item.id) ? "bg-accent" : "bg-fg-2"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              </motion.li>
            ))
          )}
        </AnimatePresence>
      </ul>
    </div>
  );
}
