"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Portal, Scrim, useBodyLock } from "@/components/ui/overlay";
import { morph, pressScale } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Shared-element lightbox: the thumbnail and the expanded view carry one
 * layoutId, so opening morphs the artwork across the screen instead of
 * cutting. Escape, scrim, or a click on the artwork closes it.
 */
export interface LightboxProps {
  /** Rendered at thumb size and again expanded; keep it presentational. */
  artwork: React.ReactNode;
  label?: string;
  thumbClassName?: string;
}

export function Lightbox({ artwork, label = "Expand", thumbClassName }: LightboxProps) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();
  useBodyLock(open);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <motion.button
        type="button"
        aria-label={label}
        layoutId={id}
        onClick={() => setOpen(true)}
        whileTap={{ scale: pressScale }}
        className={cn(
          "block h-24 w-36 overflow-hidden rounded-overlay outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          open && "invisible",
          thumbClassName
        )}
      >
        {artwork}
      </motion.button>
      <Portal>
        <AnimatePresence>
          {open && (
            <React.Fragment key="lightbox">
              <Scrim onClick={() => setOpen(false)} />
              <div
                className="fixed inset-0 z-overlay flex items-center justify-center p-10"
                onClick={() => setOpen(false)}
              >
                <motion.div
                  layoutId={id}
                  transition={morph}
                  className="h-[52vh] w-[72vw] max-w-3xl overflow-hidden rounded-overlay shadow-overlay"
                >
                  {artwork}
                </motion.div>
              </div>
            </React.Fragment>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
