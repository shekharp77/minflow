"use client";

import * as React from "react";
import { motion, useInView } from "motion/react";
import { durations, easeEnter, useMotionEnabled } from "@/lib/motion";

/*
 * The stage a live specimen stands on.
 *
 * Every component in this library is deliberately boxless, which is right in a
 * product and wrong in documentation: a row of text buttons under a paragraph
 * of prose reads as more prose. The stage is *site* chrome, not a component,
 * so it may do what the components may not - carry a fill - and that is the
 * whole reason the specimen becomes findable on the page.
 *
 * The fill is `stage`, deliberately one step beyond `bg-2` rather than equal
 * to it. That difference is load-bearing: plenty of these components carry a
 * `bg-2` surface of their own, and on a `bg-2` stage those surfaces vanish.
 */

const variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

export function DemoStage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const motionOn = useMotionEnabled();
  const ref = React.useRef<HTMLDivElement>(null);
  /* `amount: 0.1` means the release only happens once a specimen is almost
     entirely gone, so nothing ever dims while it is still being read. */
  const inView = useInView(ref, { amount: 0.1 });

  /*
   * The entrance is armed only after mount, and that is a correctness
   * requirement rather than a nicety.
   *
   * The server cannot know whether this reader wants motion, so any first
   * render that depends on the answer disagrees with the HTML it is hydrating
   * - React reported exactly that as a style mismatch when this component
   * tried to be clever about it. So both sides render the one state that is
   * always safe, visible, and the reveal takes over afterwards. A stage below
   * the fold is briefly visible before it hides itself, which nobody can see
   * precisely because it is below the fold.
   */
  const [armed, setArmed] = React.useState(false);
  React.useEffect(() => setArmed(true), []);

  const animated = armed && motionOn;

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial={false}
      animate={animated && !inView ? "hidden" : "visible"}
      transition={{ duration: durations.view, ease: easeEnter }}
      className={
        "relative isolate overflow-hidden rounded-overlay bg-stage " +
        /* Generous and asymmetric: more air above and below than beside, so a
         * short specimen still occupies a stage rather than hugging an edge. */
        "px-5 py-8 sm:px-10 sm:py-12 " +
        (className ?? "")
      }
    >
      <div className="flex min-h-10 flex-wrap items-center gap-x-6 gap-y-4">
        {children}
      </div>
    </motion.div>
  );
}
