"use client";

import { useEffect, useState } from "react";
import type { Transition, Variants } from "motion/react";

/*
 * The miniflow motion language, as data.
 *
 * Tuned to disappear. A transition earns its time by explaining a change --
 * where a panel came from, which row just left, that a press registered --
 * and then gets out of the way. Anything the eye has to wait on is too slow,
 * so the working range for interface motion is 140-360ms and the curve does
 * the work the duration used to: a hard ease-out front-loads the travel, so a
 * 240ms panel reads as further and softer than a linear 500ms one.
 *
 * Exits are always faster than entrances. An entrance is the reader arriving
 * somewhere and can afford to be graceful; an exit is a thing they have
 * already dismissed, and every extra frame it lingers is a frame they spend
 * waiting on a decision they have made.
 *
 * press .14 | micro .18 | view .24 | focal .36 | bloom .8 (decorative only)
 */

export const durations = {
  /** Pointer-down and hover feedback. Must read as instant. */
  press: 0.14,
  /** Small state flips: colour, chevron roll, focus ring, hover fill. */
  micro: 0.18,
  /** The workhorse. Panels, menus, reveals, list entrances, morphs. */
  view: 0.24,
  /** Focal surfaces that own the screen: dialog, sheet, lightbox. */
  focal: 0.36,
  /**
   * Decorative one-shots only -- an expanding halo, a blur resolving. Never
   * put a blocking transition on this: nothing the reader is waiting for is
   * allowed to take most of a second.
   */
  bloom: 0.8,
} as const;

/** Expo-out. Fast start, long glide to rest. The house entry curve. */
export const easeEnter: [number, number, number, number] = [0.16, 1, 0.3, 1];
/** Ease-in. Exits accelerate away instead of fading in place. */
export const easeExit: [number, number, number, number] = [0.55, 0, 1, 0.45];
/** Symmetric in-out for morphs, height, and layout: no visible seam. */
export const easeSoft: [number, number, number, number] = [0.32, 0.72, 0, 1];

export const enter: Transition = { duration: durations.view, ease: easeEnter };
export const exit: Transition = { duration: durations.micro, ease: easeExit };
/** Focal entrance: dialog, sheet, lightbox. */
export const enterFocal: Transition = {
  duration: durations.focal,
  ease: easeEnter,
};
/** Height and layout changes: both ends of the travel are eased. */
export const morph: Transition = { duration: durations.view, ease: easeSoft };
/** Chevrons, ticks, and other small rotations. */
export const roll: Transition = { duration: durations.micro, ease: easeSoft };

/*
 * Springs, for anything the hand is touching or that models a physical part.
 *
 * The reason to prefer a spring over a tween here is not the look, it is the
 * interruption: a spring carries velocity across a change of target, so a knob
 * grabbed mid-flight continues from where it actually is instead of restarting
 * a fixed curve. A tween re-runs; a spring keeps moving.
 *
 * Every one of these is critically damped -- `bounce: 0`. The house rule is no
 * bounce, and none of the interruptibility is bought with overshoot: damping
 * and velocity-carry are separate properties of a spring, so dropping the
 * wobble costs nothing except the wobble.
 */
export const spring: Transition = {
  type: "spring",
  duration: 0.45,
  bounce: 0,
};
/** Toggles and thumbs: settles without a visible wobble. */
export const springSnap: Transition = {
  type: "spring",
  duration: 0.3,
  bounce: 0,
};
/** Release from a drag, snapping a surface back to rest. */
export const springDrag: Transition = {
  type: "spring",
  duration: 0.5,
  bounce: 0,
};

/*
 * Press feedback. One scale for the whole library so that pressing anything
 * feels like pressing the same material. Small targets take the deeper of the
 * two: on a 40px icon button a 0.97 squash is below the threshold of notice,
 * while on a wide button 0.95 reads as a flinch.
 */
export const pressScale = 0.97;
export const pressScaleSmall = 0.95;
/** Spread onto any `motion` element that should respond to a press. */
export const press = {
  whileTap: { scale: pressScale },
  transition: { duration: durations.press, ease: easeEnter },
} as const;
export const pressSmall = {
  whileTap: { scale: pressScaleSmall },
  transition: { duration: durations.press, ease: easeEnter },
} as const;

/** Fade with 8px y-drift. Route changes, step changes, reveals. */
export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: enter },
  exit: { opacity: 0, y: -6, transition: exit },
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
    transition: { duration: durations.focal, ease: easeEnter },
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

/**
 * Parent that cascades its children in. Data renders, list entrances.
 *
 * Stagger is decorative, so it stays small. The last child of a long list must
 * not still be arriving when the reader reaches for the first one: past about
 * a dozen rows a per-child delay stops buying legibility and starts costing
 * the reader time, so long lists should pass a smaller value, not a larger.
 */
export const cascade = (stagger = 0.035, delay = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

/**
 * A transient surface that drops out of its trigger and cascades its rows in:
 * select panels, menus, popovers. Children opt in with `fadeRise`.
 *
 * The rows trail the panel by a hair rather than arriving with it, which is
 * what makes a menu read as a list you can run your eye down. That trail is
 * also why the stagger here is tighter than `cascade`: a menu is a target, and
 * a target that is still moving when the cursor lands is a mis-click.
 */
export const panel = (stagger = 0.022): Variants => ({
  hidden: { opacity: 0, scale: 0.97, y: -4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...enter, staggerChildren: stagger, delayChildren: 0.02 },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -2,
    transition: { ...exit, staggerChildren: 0, delayChildren: 0 },
  },
});

/** Collapse/expand of a measured region. Pair with overflow-hidden. */
export const reveal: Variants = {
  hidden: { height: 0, opacity: 0, transition: { ...morph, opacity: exit } },
  visible: { height: "auto", opacity: 1, transition: morph },
};

/**
 * The strike: a single ring that expands out of a status glyph and fades, so
 * an arriving toast or alert reads as something that *landed* rather than
 * something that was always there. One shot, never a loop -- a pulse that
 * repeats stops being an event and becomes a demand for attention.
 *
 * Shared rather than copied: this used to exist twice, character for
 * character, in toast and alert.
 */
export const halo: Variants = {
  hidden: { scale: 0.4, opacity: 0.45 },
  visible: {
    scale: 2.4,
    opacity: 0,
    transition: { duration: durations.bloom, ease: easeEnter },
  },
};

/** Self-drawing stroke, for ticks and marks. Feed it `pathLength`. */
export const draw: Transition = {
  duration: durations.view,
  ease: easeEnter,
};

/**
 * Velocity-based dismissal, shared by every draggable surface.
 *
 * Distance alone is the wrong test: a slow drag two thirds of the way across
 * is a reader having second thoughts, while a fast flick of 30px is a decisive
 * throw. Past ~0.11 px/ms the gesture reads as a throw regardless of how far
 * it actually travelled, so either a long drag or a fast one dismisses.
 */
export const DISMISS_VELOCITY = 0.11;

export function shouldDismiss(offset: number, velocity: number, size: number) {
  /*
   * Both tests are directional. An absolute velocity would treat a fast flick
   * back *into* the screen as a dismissal, so shoving a sheet down and
   * catching it on the way up would throw it away -- the exact opposite of
   * what the reader just did with their hand.
   */
  return velocity > DISMISS_VELOCITY * 1000 || offset > size * 0.5;
}

/**
 * True only on a device that can genuinely hover: a mouse or trackpad.
 *
 * Touchscreens synthesise a hover on tap, so an ungated hover animation plays
 * on every touch -- and then sticks, because nothing ever fires the matching
 * leave. Anything that grows, lifts, or slides on hover has to ask first; a
 * colour change is safe either way and does not need this.
 */
export function useHoverCapable(): boolean {
  /*
   * Pessimistic until proven otherwise, which is the opposite of
   * `useMotionEnabled`: an unwanted hover effect that briefly fails to appear
   * costs nothing, while one that appears on a phone and never leaves is a
   * stuck state the reader cannot clear.
   */
  const [able, setAble] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const compute = () => setAble(mq.matches);
    compute();
    mq.addEventListener("change", compute);
    return () => mq.removeEventListener("change", compute);
  }, []);

  return able;
}

/**
 * True when deliberate motion should play. Respects prefers-reduced-motion
 * and the app-level data-motion="off" switch on <html>.
 *
 * `MotionConfig reducedMotion="user"` in the root layout is the floor that
 * catches every component automatically; this hook is the opt-in ceiling, for
 * components that want to drop an animation entirely rather than have Motion
 * strip its transform. Prefer the hook wherever a component would otherwise
 * mount at zero opacity - see the note in components/site/demo-stage.
 */
export function useMotionEnabled(): boolean {
  /*
   * Starts optimistic and is corrected on mount, which is the only option that
   * hydrates cleanly: the server cannot know the reader's motion preference,
   * so a first client render that disagreed with it would be a mismatch.
   *
   * The consequence is that this value is only trustworthy AFTER mount. Never
   * let it decide whether content is visible - see components/site/demo-stage
   * for the pattern that keeps an entrance animation hydration-safe.
   */
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
