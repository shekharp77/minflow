"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { enter, pressScaleSmall } from "@/lib/motion";

/*
 * Back-to-top: appears only once the page has real depth, floats quietly,
 * and eases the viewport home.
 *
 * It sits in the trailing gutter rather than the leading one, because content
 * is aligned to the left spine and a control pinned there lands on top of it.
 * The toast stack shares this corner and sits above it.
 */
export function BackToTop({ threshold = 600 }: { threshold?: number }) {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setShow(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={enter}
          className="fixed bottom-6 right-6 z-header"
        >
          <Tooltip label="Back to top">
            <motion.button
              type="button"
              aria-label="Back to top"
              whileTap={{ scale: pressScaleSmall }}
              onClick={() => {
                const reduced = window.matchMedia(
                  "(prefers-reduced-motion: reduce)"
                ).matches;
                window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
              }}
              className="flex size-10 items-center justify-center rounded-full bg-bg-2 text-fg-2 shadow-overlay ring-1 ring-border outline-none transition-colors duration-150 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <ArrowUp className="size-4" />
            </motion.button>
          </Tooltip>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
