"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Portal, Scrim, useBodyLock, useDismiss } from "@/components/ui/overlay";
import { enterFocal, exit as exitT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Modal surface for focused decisions. Rises 8px with a 0.96 scale out of
 * the scrim, traps Tab focus, restores focus on close.
 */
export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function Dialog({ open, onClose, title, className, children }: DialogProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  useDismiss(open, onClose, [panelRef]);
  useBodyLock(open);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => prev?.focus?.();
  }, [open]);

  const trapTab = (event: React.KeyboardEvent) => {
    if (event.key !== "Tab") return;
    const nodes = panelRef.current?.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'
    );
    if (!nodes?.length) return;
    const list = [...nodes];
    const first = list[0];
    const last = list[list.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <React.Fragment key="dialog">
            <Scrim onClick={onClose} />
            <div className="pointer-events-none fixed inset-0 z-overlay flex items-center justify-center p-6">
              <motion.div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
                onKeyDown={trapTab}
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 4, transition: exitT }}
                transition={enterFocal}
                className={cn(
                  "pointer-events-auto w-full max-w-md rounded-overlay bg-bg-2 p-6 shadow-overlay ring-1 ring-border outline-none",
                  className
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-section font-semibold text-text">{title}</h2>
                  <IconButton label="Close" onClick={onClose} className="-mr-2 -mt-2">
                    <X />
                  </IconButton>
                </div>
                <div className="mt-3 text-body text-text-2">{children}</div>
              </motion.div>
            </div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </Portal>
  );
}
