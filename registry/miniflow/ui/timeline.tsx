"use client";

import * as React from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  type HTMLMotionProps,
} from "motion/react";
import { cn } from "@/lib/utils";
import { cascade, fadeRise } from "@/lib/motion";

/*
 * Chronology as an open list with a scroll-drawn spine: each segment of the
 * line fills with ink as its event crosses the lower third of the viewport,
 * and the marker wakes from faded to full in sync. The motion is scrubbed by
 * the user's own scroll, so it is noticeable but never waited on, and it
 * reverses naturally when scrolling back up.
 */
export function Timeline({ className, ...props }: HTMLMotionProps<"ol">) {
  return (
    <motion.ol
      data-slot="timeline"
      variants={cascade()}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className={cn("flex flex-col", className)}
      {...props}
    />
  );
}

export interface TimelineItemProps
  extends Omit<HTMLMotionProps<"li">, "title" | "children"> {
  /** Short fragment, 1 to 4 words. */
  title: React.ReactNode;
  /** Muted caption next to the title, e.g. "2h". */
  time?: React.ReactNode;
  /** 16px glyph for the event kind; falls back to a structural ring. */
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function TimelineItem({
  title,
  time,
  icon,
  className,
  children,
  ...props
}: TimelineItemProps) {
  const ref = React.useRef<HTMLLIElement>(null);
  const [reached, setReached] = React.useState(false);

  /* 0 to 1 as this event crosses a line 70% down the viewport */
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.7", "end 0.7"],
  });
  const fill = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 45,
    mass: 0.4,
  });

  useMotionValueEvent(scrollYProgress, "change", (value) =>
    setReached(value > 0.02)
  );

  return (
    <motion.li
      ref={ref}
      variants={fadeRise}
      className={cn("group/item flex gap-3", className)}
      {...props}
    >
      <span className="flex w-4 shrink-0 flex-col items-center gap-1.5">
        <span
          aria-hidden
          className={cn(
            "mt-0.5 flex size-4 items-center justify-center transition-colors duration-150 [&_svg]:size-4 [&_svg]:shrink-0",
            reached ? "text-fg" : "text-fg-2/50"
          )}
        >
          {icon ?? (
            <span
              className={cn(
                "size-2 rounded-full border transition-colors duration-150",
                reached ? "border-fg" : "border-fg-2/50"
              )}
            />
          )}
        </span>
        <span
          aria-hidden
          className="relative w-px flex-1 overflow-hidden bg-border group-last/item:hidden"
        >
          <motion.span
            style={{ scaleY: fill }}
            className="absolute inset-0 origin-top bg-fg"
          />
        </span>
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1 pb-6 group-last/item:pb-0">
        <div className="flex items-baseline gap-2">
          <span className="text-body font-medium text-text">{title}</span>
          {time != null && (
            <span className="text-caption text-text-2">{time}</span>
          )}
        </div>
        {children != null && (
          <div className="text-body text-text-2">{children}</div>
        )}
      </div>
    </motion.li>
  );
}
