"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Info } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { useDismiss } from "@/components/ui/overlay";
import { enter, useMotionEnabled } from "@/lib/motion";
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
  const close = React.useCallback(() => setOpen(false), [setOpen]);
  useDismiss(open, close, [rootRef]);
  const motionOk = useMotionEnabled();

  return (
    <span ref={rootRef} className="relative inline-flex">
      {React.cloneElement(trigger, {
        onClick: (e: React.MouseEvent) => {
          trigger.props.onClick?.(e);
          setOpen(!open);
        },
        "aria-expanded": open,
      })}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            /*
             * A panel that ignores the motion switch does not merely animate
             * when it should not: it opens at zero opacity and reaches full
             * only once frames arrive, so on a throttled tab the reader sees
             * the page straight through it. With motion off it simply appears.
             */
            initial={motionOk ? { opacity: 0, scale: 0.96 } : false}
            animate={{ opacity: 1, scale: 1 }}
            exit={motionOk ? { opacity: 0, scale: 0.97 } : undefined}
            transition={motionOk ? enter : { duration: 0 }}
            style={{
              transformOrigin: `${side === "bottom" ? "top" : "bottom"} ${align === "start" ? "left" : "right"}`,
            }}
            className={cn(
              "absolute z-50 min-w-44 rounded-overlay bg-bg-2 p-3 shadow-overlay ring-1 ring-border",
              side === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
              align === "start" ? "left-0" : "right-0",
              className
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
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
