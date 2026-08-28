"use client";

import * as React from "react";
import { motion } from "motion/react";
import { morph } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * iOS-style wheel: options ride a cylinder that turns under a fixed centre
 * band, receding and fading as they leave it.
 *
 * The wheel is driven by an index, not by a scrollport. A native scroll box
 * cannot hold this shape: `perspective` only reaches an element's direct
 * children, so rows nested inside a scroller flatten into a vertical squash,
 * and a wheel gesture over one moves roughly three rows per notch before
 * chaining into the page and running away. Driving `y` from state instead
 * gives one row per notch, a real cylinder, keyboard control, and nothing to
 * chain into.
 */
export interface WheelPickerProps {
  options: string[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  className?: string;
}

/** Row pitch, px. Also the hit target, so it stays finger-sized. */
const ROW = 36;
/** Rows visible either side of the band. */
const REACH = 2;
/** Wheel delta that adds up to one row. One notch is ~100px in Chrome. */
const NOTCH = 90;

export function WheelPicker({
  options,
  value,
  defaultValue,
  onValueChange,
  label = "Pick a value",
  className,
}: WheelPickerProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(() =>
    Math.max(0, options.indexOf(defaultValue ?? options[0]))
  );
  const index = isControlled
    ? Math.max(0, options.indexOf(value as string))
    : internal;

  const last = options.length - 1;
  const clamp = React.useCallback(
    (i: number) => Math.min(last, Math.max(0, i)),
    [last]
  );

  const commit = React.useCallback(
    (next: number) => {
      const i = clamp(next);
      if (i === index) return;
      if (!isControlled) setInternal(i);
      onValueChange?.(options[i]);
    },
    [clamp, index, isControlled, onValueChange, options]
  );

  /*
   * Wheel is quantised: deltas accumulate until they add up to a row, so one
   * notch turns the wheel exactly one step. At either end the event is left
   * alone so the page scrolls on past instead of the wheel swallowing it.
   */
  const viewportRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    let accum = 0;

    const onWheel = (event: WheelEvent) => {
      const goingUp = event.deltaY < 0;
      if ((goingUp && index === 0) || (!goingUp && index === last)) return;
      event.preventDefault();
      accum += event.deltaY;
      if (Math.abs(accum) < NOTCH) return;
      const steps = Math.trunc(accum / NOTCH);
      accum -= steps * NOTCH;
      commit(index + steps);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [commit, index, last]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step: Record<string, number> = { ArrowUp: -1, ArrowDown: 1 };
    if (event.key in step) {
      event.preventDefault();
      commit(index + step[event.key]);
    } else if (event.key === "Home") {
      event.preventDefault();
      commit(0);
    } else if (event.key === "End") {
      event.preventDefault();
      commit(last);
    }
  };

  const height = ROW * (REACH * 2 + 1);
  const fade = `linear-gradient(to bottom, transparent, black ${ROW * 0.7}px, black calc(100% - ${ROW * 0.7}px), transparent)`;

  return (
    <div
      ref={viewportRef}
      role="listbox"
      aria-label={label}
      aria-activedescendant={`wheel-${label}-${index}`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "relative w-28 touch-none select-none overflow-hidden rounded-control outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
        className
      )}
      style={{ height, perspective: "700px" }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-control bg-hover"
        style={{ height: ROW }}
      />
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.14}
        onDragEnd={(_, info) => commit(index - Math.round(info.offset.y / ROW))}
        animate={{ y: 0 }}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{ transformStyle: "preserve-3d", maskImage: fade, WebkitMaskImage: fade }}
      >
        {options.map((option, i) => {
          const d = i - index;
          if (Math.abs(d) > REACH + 1) return null;
          return (
            <motion.div
              key={option}
              id={`wheel-${label}-${i}`}
              role="option"
              aria-selected={i === index}
              onClick={() => {
                /*
                 * Focus the wheel, not just the row: the arrow keys live on
                 * the container, so without this a pointer user who taps the
                 * wheel still cannot then arrow through it.
                 */
                viewportRef.current?.focus();
                commit(i);
              }}
              initial={false}
              animate={{
                y: height / 2 - ROW / 2 + d * ROW,
                rotateX: Math.max(-64, Math.min(64, d * -26)),
                scale: 1 - 0.07 * Math.abs(d),
                opacity: Math.max(0, 1 - 0.32 * Math.abs(d)),
              }}
              transition={morph}
              className={cn(
                "absolute inset-x-0 flex cursor-pointer items-center justify-center text-body transition-colors duration-150",
                i === index ? "font-medium text-text" : "text-text-2"
              )}
              style={{ height: ROW }}
            >
              {option}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
