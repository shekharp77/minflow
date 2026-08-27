"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { MenuCloseContext } from "@/components/ui/menu";
import { Portal, useDismiss } from "@/components/ui/overlay";
import { enter } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Contextual menu: right-click summons actions at the cursor, scaling out
 * of the exact point that was clicked.
 */
export interface ContextMenuProps {
  content: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function ContextMenu({ content, className, children }: ContextMenuProps) {
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => setPos(null), []);
  useDismiss(pos !== null, close, [panelRef]);

  return (
    <MenuCloseContext.Provider value={close}>
      <div
        onContextMenu={(event) => {
          event.preventDefault();
          setPos({
            x: Math.min(event.clientX, window.innerWidth - 200),
            y: Math.min(event.clientY, window.innerHeight - 200),
          });
        }}
        className={className}
      >
        {children}
      </div>
      <Portal>
        <AnimatePresence>
          {pos && (
            <motion.div
              ref={panelRef}
              role="menu"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={enter}
              style={{ left: pos.x, top: pos.y, transformOrigin: "top left" }}
              className={cn(
                "fixed z-[70] min-w-44 rounded-overlay bg-bg-2 p-1 shadow-overlay ring-1 ring-border"
              )}
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </MenuCloseContext.Provider>
  );
}
