"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { durations, easeEnter, easeSoft, pressScale, useMotionEnabled } from "@/lib/motion";

/*
 * The primary navigation of a phone app: three to five destinations, always
 * reachable, never more than one tap away.
 *
 * The label of the current destination is the indicator. Inactive items keep
 * their glyph and drop their word, so the bar stays quiet until you look at
 * it, and the active item is the only thing spelled out. The travelling pill
 * behind it is a single shared element, so switching tabs is one movement.
 */
export interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  /** Small count on the glyph. Zero and undefined both render nothing. */
  badge?: number;
}

export interface BottomNavProps {
  items: BottomNavItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  /** Always show every label, the way Android's bar does. */
  showAllLabels?: boolean;
  className?: string;
}

export function BottomNav({
  items,
  value,
  defaultValue,
  onChange,
  showAllLabels = false,
  className,
}: BottomNavProps) {
  const motionOn = useMotionEnabled();
  const uid = React.useId();
  const [internal, setInternal] = React.useState(defaultValue ?? items[0]?.id);
  const active = value ?? internal;

  const pick = (id: string) => {
    if (value === undefined) setInternal(id);
    onChange?.(id);
  };

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "flex w-full items-stretch justify-around gap-1 bg-bg/85 px-2 py-1.5 backdrop-blur",
        className
      )}
    >
      {items.map((item) => {
        const on = item.id === active;
        return (
          <motion.button
            key={item.id}
            type="button"
            aria-current={on ? "page" : undefined}
            whileTap={motionOn ? { scale: pressScale } : undefined}
            onClick={() => pick(item.id)}
            className={cn(
              "relative inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-2 outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              on ? "text-text" : "text-text-2 hover:text-text"
            )}
          >
            {on && (
              <motion.span
                aria-hidden
                layoutId={motionOn ? `${uid}-pill` : undefined}
                transition={{ duration: durations.micro, ease: easeSoft }}
                className="absolute inset-0 -z-10 rounded-full bg-bg-2"
              />
            )}
            <motion.span
              animate={{ scale: on ? 1 : 0.94 }}
              transition={{ duration: motionOn ? durations.micro : 0, ease: easeEnter }}
              className="relative flex shrink-0 [&_svg]:size-5"
            >
              {item.icon}
              {item.badge ? (
                <span className="absolute -right-1.5 -top-1 min-w-4 rounded-full bg-accent px-1 text-center text-[0.625rem] font-medium leading-4 text-on-accent">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              ) : null}
            </motion.span>

            {/* The word arrives with the selection and leaves with it. Width is
                animated as well as opacity, so the row re-centres smoothly
                instead of the labels jumping sideways. */}
            <motion.span
              initial={false}
              /* One system owns opacity and width. Splitting it between a
                 `hidden` class and a motion value means two sources of truth
                 for the same pixels, and motion's inline style silently wins. */
              animate={{
                opacity: on || showAllLabels ? 1 : 0,
                width: on || showAllLabels ? "auto" : 0,
              }}
              transition={{ duration: motionOn ? durations.micro : 0, ease: easeSoft }}
              className="overflow-hidden whitespace-nowrap text-caption font-medium"
            >
              {item.label}
            </motion.span>
          </motion.button>
        );
      })}
    </nav>
  );
}
