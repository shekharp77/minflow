"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { enter, morph } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Tab bar: one ink underline slides between triggers (shared layout), the
 * leaving panel hands off to the arriving one with a fade-rise.
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
  const id = React.useId();
  const active = tabs.find((t) => t.value === value);

  return (
    <div className={cn("w-full", className)}>
      <div
        role="tablist"
        className="flex items-center gap-1"
        onKeyDown={(event) => {
          const index = tabs.findIndex((t) => t.value === value);
          if (event.key === "ArrowRight") {
            event.preventDefault();
            setValue(tabs[(index + 1) % tabs.length].value);
          } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            setValue(tabs[(index - 1 + tabs.length) % tabs.length].value);
          }
        }}
      >
        {tabs.map((tab) => {
          const selected = tab.value === value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => setValue(tab.value)}
              className={cn(
                "relative h-8 rounded-control px-2.5 text-body outline-none transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
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
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={value}
            role="tabpanel"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={enter}
            className="text-body text-text-2"
          >
            {active?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
