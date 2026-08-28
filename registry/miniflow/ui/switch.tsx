"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { durations, easeEnter, springSnap, useMotionEnabled } from "@/lib/motion";

/*
 * From-scratch switch: a real button with role="switch", controlled or
 * uncontrolled. The on-state wears --fg, not the accent, so flipping a
 * setting never competes with the view's one accented action.
 *
 * The knob runs on a spring rather than a tween because it is the one part of
 * this component that models a physical object. A spring carries velocity
 * across an interruption, so a switch flipped twice in quick succession
 * continues from wherever the knob actually is instead of restarting -- which
 * is the difference between a control that feels connected to the hand and one
 * that feels like it is playing back a recording.
 *
 * While held, the knob stretches toward the side it is about to travel to.
 * That is the whole trick behind a switch that feels sprung: the press loads
 * it, the release fires it.
 */
export interface SwitchProps
  extends Omit<React.ComponentProps<"button">, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({
  checked,
  defaultChecked,
  onCheckedChange,
  className,
  disabled,
  onClick,
  ...props
}: SwitchProps) {
  const [internal, setInternal] = React.useState(defaultChecked ?? false);
  const [held, setHeld] = React.useState(false);
  const isControlled = checked !== undefined;
  const on = isControlled ? checked : internal;
  const motionOk = useMotionEnabled();

  const release = () => setHeld(false);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      data-slot="switch"
      disabled={disabled}
      onPointerDown={() => setHeld(true)}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const next = !on;
        if (!isControlled) setInternal(next);
        onCheckedChange?.(next);
      }}
      className={cn(
        "relative inline-flex h-5 w-8 shrink-0 items-center rounded-full px-0.5 outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50",
        on ? "bg-fg" : "bg-border-strong",
        className
      )}
      {...props}
    >
      <motion.span
        aria-hidden
        /*
         * The knob is 16px in a 32px track with 2px of padding, so its travel
         * is 12px. Stretching it while held eats into that, which is why the
         * stretch is applied as scaleX about the leading edge rather than as
         * width: a transform cannot change the geometry the travel is measured
         * against.
         */
        animate={{
          x: on ? 12 : 0,
          scaleX: held && motionOk ? 1.18 : 1,
        }}
        style={{ transformOrigin: on ? "right center" : "left center" }}
        transition={
          motionOk
            ? { ...springSnap, scaleX: { duration: durations.press, ease: easeEnter } }
            : { duration: 0 }
        }
        className="block size-4 rounded-full bg-bg shadow-sm ring-1 ring-border"
      />
    </button>
  );
}
