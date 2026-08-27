"use client";

import { useEffect, useState } from "react";
import type { Transition, Variants } from "motion/react";

/*
 * The miniflow motion language, as data.
 *
 * Tuned slow and smooth on purpose: entries decelerate on a long expo tail so
 * the eye can follow the whole travel, and every state change animates rather
 * than snapping. Only pointer feedback stays fast, because a control that lags
 * its own press feels broken no matter how pretty the curve is.
 *
 * press .14 | micro .3 | view .55 | ceiling .8, travel <= 12px, stagger 80ms.
 */

export const durations = {
  /** Pointer-down and hover feedback. Must read as instant. */
  press: 0.14,
  /** Small state flips: colour, chevron roll, focus ring. */
  micro: 0.3,
  /** Reveals, panels, expansions, list entrances. */
  view: 0.55,
  /** Large or focal entrances. Nothing goes slower than this. */
  ceiling: 0.8,
} as const;

/** Expo-out. Fast start, long glide to rest. The house entry curve. */
export const easeEnter: [number, number, number, number] = [0.16, 1, 0.3, 1];
/** Ease-in. Exits leave without lingering. */
export const easeExit: [number, number, number, number] = [0.55, 0, 1, 0.45];
/** Symmetric in-out for morphs, height, and layout: no visible seam. */
export const easeSoft: [number, number, number, number] = [0.32, 0.72, 0, 1];

export const enter: Transition = { duration: durations.view, ease: easeEnter };
export const exit: Transition = { duration: durations.micro, ease: easeExit };
/** Height and layout changes: both ends of the travel are eased. */
export const morph: Transition = { duration: durations.view, ease: easeSoft };
/** Chevrons, ticks, and other small rotations. */
export const roll: Transition = { duration: durations.micro, ease: easeSoft };

/** Fade with 10px y-drift. Route changes, step changes, reveals. */
export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: enter },
  exit: { opacity: 0, y: -10, transition: exit },
};

/** Fade with 0.97 scale. Component mounts, popover-like reveals. */
export const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: enter },
  exit: { opacity: 0, scale: 0.97, transition: exit },
};

/**
 * Fade + rise + defocus. The softest entrance in the system: content resolves
 * out of blur instead of appearing. Costs a GPU blur per element, so it is for
 * one surface at a time (a panel, an alert, a step), never a hundred rows.
 */
export const blurRise: Variants = {
  hidden: { opacity: 0, y: 8, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: durations.ceiling, ease: easeEnter },
  },
  exit: {
    opacity: 0,
    y: -6,
    filter: "blur(4px)",
    transition: { duration: durations.micro, ease: easeExit },
  },
};

/** Horizontal counterpart of fadeRise. Trails, crumbs, inline appends. */
export const fadeSlide = (from = -8): Variants => ({
  hidden: { opacity: 0, x: from },
  visible: { opacity: 1, x: 0, transition: enter },
  exit: { opacity: 0, x: from, transition: exit },
});

/** Parent that cascades its children in. Data renders, list entrances. */
export const cascade = (stagger = 0.08, delay = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

/**
 * A transient surface that drops out of its trigger and cascades its rows in:
 * select panels, menus, popovers. Children opt in with `fadeRise`.
 */
export const panel = (stagger = 0.05): Variants => ({
  hidden: { opacity: 0, scale: 0.97, y: -4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...enter, staggerChildren: stagger, delayChildren: 0.04 },
  },
  exit: { opacity: 0, scale: 0.98, y: -2, transition: exit },
});

/** Collapse/expand of a measured region. Pair with overflow-hidden. */
export const reveal: Variants = {
  hidden: { height: 0, opacity: 0, transition: { ...morph, opacity: exit } },
  visible: { height: "auto", opacity: 1, transition: morph },
};

/** Self-drawing stroke, for ticks and marks. Feed it `pathLength`. */
export const draw: Transition = {
  duration: durations.view,
  ease: easeEnter,
};

/**
 * True when deliberate motion should play. Respects prefers-reduced-motion
 * and the app-level data-motion="off" switch on <html>.
 */
export function useMotionEnabled(): boolean {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const el = document.documentElement;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compute = () =>
      setEnabled(!mq.matches && el.getAttribute("data-motion") !== "off");
    compute();
    mq.addEventListener("change", compute);
    const observer = new MutationObserver(compute);
    observer.observe(el, { attributes: true, attributeFilter: ["data-motion"] });
    return () => {
      mq.removeEventListener("change", compute);
      observer.disconnect();
    };
  }, []);

  return enabled;
}
