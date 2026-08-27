"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { useDismiss } from "@/components/ui/overlay";
import { enter, roll } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Pie menu: options bloom outward from the handle onto a circle, each one
 * a beat behind the last; the handle's plus rolls into a close. Selecting
 * an option collapses the ring back into the center.
 */
export interface PieMenuItem {
  icon: React.ReactNode;
  label: string;
  onSelect?: () => void;
}

export interface PieMenuProps {
  items: PieMenuItem[];
  radius?: number;
  label?: string;
  className?: string;
}

export function PieMenu({
  items,
  radius = 64,
  label = "Actions",
  className,
}: PieMenuProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => setOpen(false), []);
  useDismiss(open, close, [rootRef]);

  return (
    <div
      ref={rootRef}
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: radius * 2 + 48, height: radius * 2 + 48 }}
    >
      <AnimatePresence>
        {open &&
          items.map((item, i) => {
            const angle = (-90 + (360 / items.length) * i) * (Math.PI / 180);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            return (
              <motion.span
                key={item.label}
                initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                animate={{
                  x,
                  y,
                  scale: 1,
                  opacity: 1,
                  transition: { ...enter, delay: 0.06 * i },
                }}
                exit={{
                  x: 0,
                  y: 0,
                  scale: 0,
                  opacity: 0,
                  transition: {
                    delay: 0.025 * (items.length - 1 - i),
                    duration: 0.3,
                    ease: [0.55, 0, 1, 0.45],
                  },
                }}
                className="absolute"
              >
                <Tooltip label={item.label}>
                  <button
                    type="button"
                    aria-label={item.label}
                    onClick={() => {
                      item.onSelect?.();
                      setOpen(false);
                    }}
                    className="flex size-10 items-center justify-center rounded-full bg-bg-2 text-fg-2 shadow-overlay ring-1 ring-border outline-none transition-colors duration-200 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&_svg]:size-4"
                  >
                    {item.icon}
                  </button>
                </Tooltip>
              </motion.span>
            );
          })}
      </AnimatePresence>
      <Tooltip label={open ? "Close" : label}>
        <motion.button
          type="button"
          aria-label={open ? "Close" : label}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          whileTap={{ scale: 0.94 }}
          animate={{ rotate: open ? 45 : 0 }}
          transition={roll}
          className="relative z-10 flex size-12 items-center justify-center rounded-full bg-fg text-bg shadow-overlay outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&_svg]:size-5"
        >
          <Plus />
        </motion.button>
      </Tooltip>
    </div>
  );
}
