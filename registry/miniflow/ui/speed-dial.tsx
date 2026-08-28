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

/*
 * `place` positions the fan against the trigger's own box rather than beside
 * it in flow. That distinction is the whole fix: a fan that is a flow sibling
 * of the trigger grows the shared container when it mounts, which shoves the
 * trigger to a new position at the exact moment the reader is aiming at it.
 * Out of flow, the trigger cannot move, so the second click always lands.
 *
 * The cross-axis is centred on the trigger so the fan is symmetric wherever
 * the control sits, and `stack` keeps the nearest action closest to the
 * trigger on every axis.
 */
const AXIS = {
  up: {
    stack: "flex-col-reverse items-center",
    from: { y: 12 },
    place: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  },
  down: {
    stack: "flex-col items-center",
    from: { y: -12 },
    place: "top-full left-1/2 mt-2 -translate-x-1/2",
  },
  left: {
    stack: "flex-row-reverse items-center",
    from: { x: 12 },
    place: "right-full top-1/2 mr-2 -translate-y-1/2",
  },
  right: {
    stack: "flex-row items-center",
    from: { x: -12 },
    place: "left-full top-1/2 ml-2 -translate-y-1/2",
  },
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
      /* Sized by the trigger alone. Nothing the fan does can change this box,
         which is what keeps the trigger still. */
      className={cn("relative inline-flex", className)}
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
              "absolute z-anchored flex w-max list-none gap-2",
              axis.stack,
              axis.place
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
