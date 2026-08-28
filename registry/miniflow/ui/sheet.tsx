"use client";

import * as React from "react";
import { AnimatePresence, motion, useDragControls, type PanInfo } from "motion/react";
import { X } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Portal, Scrim, useBodyLock, useDismiss } from "@/components/ui/overlay";
import {
  durations,
  easeSoft,
  exit as exitT,
  shouldDismiss,
  springDrag,
  useMotionEnabled,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Edge-anchored overlay: side sheet (drawer) slides from the right, bottom
 * sheet rises from the bottom with a grab handle that is wired to a real
 * drag, because an affordance that does not do the thing it depicts is worse
 * than no affordance at all.
 *
 * Travel is expressed in percentages, never pixels, so the panel always
 * starts exactly its own height (or width) offscreen no matter how tall the
 * content turns out to be.
 *
 * The curve is `easeSoft` rather than the house entry curve: a drawer is a
 * physical panel sliding in a track, and the symmetric in-out is what sells
 * the weight. The house expo-out is for things that appear, not things that
 * travel.
 */
export interface SheetProps {
  open: boolean;
  onClose: () => void;
  side?: "right" | "bottom";
  title?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function Sheet({
  open,
  onClose,
  side = "right",
  title,
  className,
  children,
}: SheetProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  useDismiss(open, onClose, [panelRef]);
  useBodyLock(open);
  const motionOk = useMotionEnabled();
  const dragControls = useDragControls();

  const fromRight = side === "right";
  const axis = fromRight ? "x" : "y";

  /*
   * Distance alone is the wrong test for a dismissal. A slow drag most of the
   * way across is a reader having second thoughts; a fast flick of 30px is a
   * decisive throw. Past the velocity threshold the gesture reads as a throw
   * however far it actually travelled, so either a long drag or a quick one
   * lets go of the sheet.
   */
  const onDragEnd = (_: unknown, info: PanInfo) => {
    const el = panelRef.current;
    if (!el) return;
    const size = fromRight ? el.offsetWidth : el.offsetHeight;
    const travelled = fromRight ? info.offset.x : info.offset.y;
    const speed = fromRight ? info.velocity.x : info.velocity.y;
    if (shouldDismiss(travelled, speed, size)) onClose();
  };

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <React.Fragment key="sheet">
            <Scrim onClick={onClose} />
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              initial={fromRight ? { x: "100%" } : { y: "100%" }}
              animate={fromRight ? { x: 0 } : { y: 0 }}
              exit={
                fromRight
                  ? { x: "100%", transition: exitT }
                  : { y: "100%", transition: exitT }
              }
              transition={
                motionOk
                  ? { duration: durations.focal, ease: easeSoft }
                  : { duration: 0 }
              }
              drag={axis}
              /*
               * The side sheet takes a drag anywhere on its face, the way a
               * back-swipe works. The bottom sheet does not: dragging its body
               * would fight any scrollable content inside it, so the gesture
               * is started by the handle alone -- which is exactly what the
               * handle is drawn to promise.
               */
              dragListener={fromRight}
              dragControls={dragControls}
              dragMomentum={false}
              /*
               * Zero on the closed side pins the sheet to its open position so
               * it cannot be dragged into the screen; the open side is left
               * free to travel. `dragElastic` supplies the rubber-band, so a
               * pull the wrong way still moves and still refuses to go
               * anywhere.
               */
              dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
              dragElastic={fromRight ? { right: 1, left: 0.04 } : { bottom: 1, top: 0.04 }}
              dragDirectionLock
              onDragEnd={onDragEnd}
              /*
               * Constraints pinned to zero mean a released drag that did not
               * meet the dismissal test animates back to the open position on
               * its own -- the snap-back is the constraint, not a second
               * animation that could disagree with it.
               */
              /* Critically damped (2*sqrt(520) ~= 46): the surface returns to
                 rest without overshooting past it. */
              dragTransition={{ bounceStiffness: 520, bounceDamping: 46 }}
              style={{ touchAction: fromRight ? "pan-y" : "auto" }}
              className={cn(
                "fixed z-50 bg-bg-2 shadow-overlay",
                fromRight
                  ? "inset-y-0 right-0 w-80 max-w-[85vw] p-6 ring-1 ring-border"
                  : "inset-x-0 bottom-0 max-h-[70vh] rounded-t-overlay p-6 pt-3 ring-1 ring-border",
                className
              )}
            >
              {!fromRight && (
                /*
                 * The handle is the drag surface, so it needs a real hit area
                 * and a real cursor. The visible rule stays 1px: the touch
                 * target is the padding around it, not the mark itself.
                 */
                <span
                  onPointerDown={(event) => dragControls.start(event)}
                  className="mx-auto -mt-1 mb-3 flex h-6 w-16 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
                >
                  <motion.span
                    aria-hidden
                    className="block h-1 w-8 rounded-full bg-border-strong"
                    whileHover={motionOk ? { scaleX: 1.15 } : undefined}
                    transition={springDrag}
                  />
                </span>
              )}
              <div className="flex items-start justify-between gap-4">
                {title != null && (
                  <h2 className="text-section font-semibold text-text">{title}</h2>
                )}
                <IconButton label="Close" onClick={onClose} className="-mr-2 -mt-2 ml-auto">
                  <X />
                </IconButton>
              </div>
              <div className="mt-3 text-body text-text-2">{children}</div>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </Portal>
  );
}
