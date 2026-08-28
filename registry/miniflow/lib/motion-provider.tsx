"use client";

import * as React from "react";
import { MotionConfig } from "motion/react";

/*
 * The floor under every animation in the library.
 *
 * `globals.css` already zeroes CSS transitions and CSS keyframes for a reader
 * who has asked for reduced motion, but that rule cannot reach Motion: Motion
 * animates by writing inline styles frame by frame, so it is neither a CSS
 * transition nor a CSS animation and no stylesheet can turn it off. Without
 * this provider, the preference is silently ignored by every component that
 * does not call `useMotionEnabled` by hand -- which was most of them.
 *
 * `reducedMotion="user"` is the right setting rather than "always": it strips
 * transform and layout animation (the part that causes trouble) while leaving
 * opacity and colour intact, so a dialog still fades rather than teleporting.
 * Reduced motion means less movement, not a dead interface.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
