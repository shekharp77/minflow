"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { durations, easeEnter, easeSoft, pressScaleSmall, useMotionEnabled } from "@/lib/motion";

/*
 * One primary control that fans out into the handful of things it can start.
 *
 * Unlike the pie menu, the actions come out in a line and keep their labels,
 * which is what makes this the right choice when the actions are not
 * interchangeable and a first-time user has to read them. The trigger rotates
 * into a close mark rather than swapping glyphs, so the same object is
 * obviously still the same object.
 */
export interface SpeedDialAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onSelect?: () => void;
}

export interface SpeedDialProps {
  actions: SpeedDialAction[];
  label?: string;
  /** Which way the actions travel. */
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}

const AXIS = {
  up: { stack: "flex-col-reverse", from: { y: 12 } },
  down: { stack: "flex-col", from: { y: -12 } },
  left: { stack: "flex-row-reverse", from: { x: 12 } },
  right: { stack: "flex-row", from: { x: -12 } },
} as const;

export function SpeedDial({
  actions,
  label = "Create",
  direction = "up",
  className,
}: SpeedDialProps) {
  const motionOn = useMotionEnabled();
  const [open, setOpen] = React.useState(false);
  const root = React.useRef<HTMLDivElement>(null);
  const axis = AXIS[direction];
  const vertical = direction === "up" || direction === "down";

  /* Escape and outside-press both close, because a fan of actions left open
     over content is worse than the click it saved. */
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div
      ref={root}
      className={cn(
        "inline-flex items-center gap-2",
        axis.stack,
        vertical ? "items-end" : "items-center",
        className
      )}
    >
      <motion.button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        whileTap={motionOn ? { scale: pressScaleSmall } : undefined}
        className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-fg text-bg outline-none transition-opacity duration-150 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <motion.span
          /* The rotation IS the close affordance, so it survives motion being
             off; only the travel between the two angles is a motion concern. */
          animate={{ rotate: open ? 135 : 0 }}
          transition={{ duration: motionOn ? durations.micro : 0, ease: easeSoft }}
          className="flex [&_svg]:size-5"
        >
          <Plus aria-hidden />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.ul
            className={cn(
              "flex list-none gap-2",
              axis.stack,
              vertical ? "items-end" : "items-center"
            )}
          >
            {actions.map((action, i) => (
              <motion.li
                key={action.id}
                initial={motionOn ? { opacity: 0, scale: 0.8, ...axis.from } : false}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                exit={
                  motionOn
                    ? { opacity: 0, scale: 0.8, ...axis.from }
                    : undefined
                }
                transition={{
                  duration: durations.micro,
                  ease: easeEnter,
                  /* Nearest action first, so the fan unrolls from the trigger. */
                  delay: motionOn ? i * 0.05 : 0,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    action.onSelect?.();
                    setOpen(false);
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-bg-2 px-3.5 text-body font-medium text-text outline-none transition-colors duration-150 hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&_svg]:size-4 [&_svg]:shrink-0"
                >
                  <span className="text-fg-2">{action.icon}</span>
                  {action.label}
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
