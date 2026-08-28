"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { durations, easeEnter, useMotionEnabled } from "@/lib/motion";

/*
 * The bar that stays at the top of a screen and tells you where you are.
 *
 * At the top of a page it is invisible chrome: no fill, no rule, just the
 * title sitting on the page. Once content scrolls under it, the fill and the
 * blur fade in - so the separation appears exactly when there is something to
 * separate, and never as permanent furniture. That is the same reason the
 * title only slides in once the page's own heading has scrolled away.
 */
export interface AppBarProps {
  title: string;
  /** Back control, menu button, or a mark. */
  leading?: React.ReactNode;
  /** Row actions, right aligned. */
  actions?: React.ReactNode;
  /**
   * Scroll distance in px at which the bar condenses. The element scrolled is
   * whatever `scrollRef` points at, or the window.
   */
  condenseAt?: number;
  scrollRef?: React.RefObject<HTMLElement | null>;
  /** Renders the title only after condensing, for a large-title layout. */
  revealTitleOnScroll?: boolean;
  className?: string;
}

export function AppBar({
  title,
  leading,
  actions,
  condenseAt = 24,
  scrollRef,
  revealTitleOnScroll = false,
  className,
}: AppBarProps) {
  const motionOn = useMotionEnabled();
  const [condensed, setCondensed] = React.useState(false);

  React.useEffect(() => {
    const target: HTMLElement | Window = scrollRef?.current ?? window;
    const read = () =>
      setCondensed(
        (target instanceof Window ? window.scrollY : target.scrollTop) > condenseAt
      );
    read();
    target.addEventListener("scroll", read, { passive: true });
    return () => target.removeEventListener("scroll", read);
  }, [condenseAt, scrollRef]);

  const showTitle = revealTitleOnScroll ? condensed : true;

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-12 items-center gap-2 px-3 transition-[background-color,backdrop-filter] duration-300",
        condensed ? "bg-bg/85 backdrop-blur" : "bg-transparent",
        className
      )}
    >
      {leading}
      <div className="min-w-0 flex-1">
        <AnimatePresence initial={false}>
          {showTitle && (
            <motion.h2
              key="title"
              initial={motionOn ? { opacity: 0, y: 6 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={motionOn ? { opacity: 0, y: 6 } : undefined}
              transition={{ duration: durations.micro, ease: easeEnter }}
              className="truncate text-emphasis font-medium text-text"
            >
              {title}
            </motion.h2>
          )}
        </AnimatePresence>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-0.5">{actions}</div> : null}
    </header>
  );
}
