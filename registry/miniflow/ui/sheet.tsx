"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Portal, Scrim, useBodyLock, useDismiss } from "@/components/ui/overlay";
import { enter } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Edge-anchored overlay: side sheet (drawer) slides from the right, bottom
 * sheet rises from the bottom with a visible grab-handle affordance.
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

  const fromRight = side === "right";

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
              exit={fromRight ? { x: "100%" } : { y: "100%" }}
              transition={enter}
              className={cn(
                "fixed z-50 bg-bg-2 shadow-overlay",
                fromRight
                  ? "inset-y-0 right-0 w-80 max-w-[85vw] p-6 ring-1 ring-border"
                  : "inset-x-0 bottom-0 max-h-[70vh] rounded-t-overlay p-6 pt-3 ring-1 ring-border",
                className
              )}
            >
              {!fromRight && (
                <span
                  aria-hidden
                  className="mx-auto mb-4 block h-1 w-8 rounded-full bg-border-strong"
                />
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
