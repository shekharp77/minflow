"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { enter, exit as exitT, morph, press, useMotionEnabled } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Tab bar: one ink underline slides between triggers (shared layout), the
 * leaving panel hands off to the arriving one with a fade-rise.
 *
 * The underline is the component's whole spatial argument -- it is what makes
 * switching read as one thing moving rather than two things blinking -- so it
 * animates even when the panel does not.
 */
export interface TabItem {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
}

export function Tabs({ tabs, defaultValue, className }: TabsProps) {
  const [value, setValue] = React.useState(defaultValue ?? tabs[0]?.value);
  /*
   * Arrow keys walk the whole bar, so a reader scanning with the keyboard
   * triggers a panel swap per keypress -- far too often to animate. Pointer
   * selection is occasional and gets the crossfade; keyboard selection cuts
   * straight to the content, which is the only way holding the key down stays
   * legible. The underline keeps moving either way.
   */
  const [viaKey, setViaKey] = React.useState(false);
  const id = React.useId();
  const motionOk = useMotionEnabled();
  const active = tabs.find((t) => t.value === value);

  const step = (delta: number) => {
    const index = tabs.findIndex((t) => t.value === value);
    setViaKey(true);
    setValue(tabs[(index + delta + tabs.length) % tabs.length].value);
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        role="tablist"
        className="flex items-center gap-1"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            step(1);
          } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            step(-1);
          }
        }}
      >
        {tabs.map((tab) => {
          const selected = tab.value === value;
          return (
            <motion.button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => {
                setViaKey(false);
                setValue(tab.value);
              }}
              {...(motionOk ? press : {})}
              className={cn(
                "relative h-8 rounded-control px-2.5 text-body outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                selected ? "font-medium text-text" : "text-text-2 hover:text-text"
              )}
            >
              {tab.label}
              {selected && (
                <motion.span
                  layoutId={`${id}-ink`}
                  transition={morph}
                  className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-fg"
                />
              )}
            </motion.button>
          );
        })}
      </div>
      <div className="mt-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={value}
            role="tabpanel"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            /*
             * `mode="wait"` runs the exit to completion before the entrance
             * starts, so the two durations add up on screen. The exit is kept
             * deliberately short for that reason: the reader has already
             * chosen, and the only thing left to do is get out of the way.
             */
            exit={{
              opacity: 0,
              y: -4,
              transition: viaKey || !motionOk ? { duration: 0 } : exitT,
            }}
            transition={viaKey || !motionOk ? { duration: 0 } : enter}
            className="text-body text-text-2"
          >
            {active?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
