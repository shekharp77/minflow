"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Info } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Portal, useAnchoredPosition, useDismiss } from "@/components/ui/overlay";
import { enter, exit as exitT, useMotionEnabled } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Anchored transient surface. Scales out of its anchor edge (origin-aware
 * fade + 0.96 scale), dismissed by Escape or pointer-down outside.
 */
export interface PopoverProps {
  trigger: React.ReactElement<{ onClick?: (e: React.MouseEvent) => void; "aria-expanded"?: boolean }>;
  side?: "top" | "bottom";
  align?: "start" | "end";
  /** Controlled open state; omit for uncontrolled. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: React.ReactNode;
}

export function Popover({
  trigger,
  side = "bottom",
  align = "start",
  open: openProp,
  onOpenChange,
  className,
  children,
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const setOpen = React.useCallback(
    (v: boolean) => {
      if (!isControlled) setInternalOpen(v);
      onOpenChange?.(v);
    },
    [isControlled, onOpenChange]
  );
  const rootRef = React.useRef<HTMLSpanElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => setOpen(false), [setOpen]);
  /* The panel is portalled, so it is no longer a descendant of the trigger.
     It has to be named here or a press inside it reads as "outside" and the
     popover closes under the reader's own click. */
  useDismiss(open, close, [rootRef, panelRef]);
  const motionOk = useMotionEnabled();
  const { style, origin } = useAnchoredPosition(open, rootRef, panelRef, { side, align });

  return (
    <span ref={rootRef} className="relative inline-flex">
      {React.cloneElement(trigger, {
        onClick: (e: React.MouseEvent) => {
          trigger.props.onClick?.(e);
          setOpen(!open);
        },
        "aria-expanded": open,
      })}
      <Portal>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            /*
             * A panel that ignores the motion switch does not merely animate
             * when it should not: it opens at zero opacity and reaches full
             * only once frames arrive, so on a throttled tab the reader sees
             * the page straight through it. With motion off it simply appears.
             */
            initial={motionOk ? { opacity: 0, scale: 0.96 } : false}
            animate={{ opacity: 1, scale: 1 }}
            exit={
              motionOk
                ? { opacity: 0, scale: 0.98, transition: exitT }
                : undefined
            }
            transition={motionOk ? enter : { duration: 0 }}
            style={{ ...style, transformOrigin: origin }}
            className={cn(
              "z-anchored min-w-44 overflow-y-auto rounded-overlay bg-bg-2 p-3 shadow-overlay ring-1 ring-border",
              className
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>
    </span>
  );
}

/* Popup tip: the tap-to-reveal cousin of the tooltip, for touch and detail. */
export function PopupTip({
  label = "More info",
  children,
  side,
  align,
}: {
  label?: string;
  children: React.ReactNode;
  side?: "top" | "bottom";
  align?: "start" | "end";
}) {
  return (
    <Popover
      side={side}
      align={align}
      className="max-w-56"
      trigger={
        <IconButton label={label}>
          <Info />
        </IconButton>
      }
    >
      <p className="text-caption text-text-2">{children}</p>
    </Popover>
  );
}
