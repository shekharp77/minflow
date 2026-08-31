"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Menu } from "@/components/ui/menu";
import { pressScale, useMotionEnabled } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * The application menu row: File, Edit, View.
 *
 * What separates a menubar from a row of dropdowns is one rule - once any menu
 * is open, pointing at a sibling switches to it without a second click. That
 * is the whole reason to reach for this component, so the open menu is held
 * here rather than inside each Menu.
 */
export interface MenubarSection {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface MenubarProps {
  sections: MenubarSection[];
  className?: string;
}

export function Menubar({ sections, className }: MenubarProps) {
  const [open, setOpen] = React.useState<string | null>(null);
  const motionOk = useMotionEnabled();

  return (
    <div role="menubar" className={cn("flex items-center gap-0.5", className)}>
      {sections.map((section) => (
        <Menu
          key={section.id}
          align="start"
          open={open === section.id}
          onOpenChange={(next) => setOpen(next ? section.id : null)}
          trigger={
            <motion.button
              type="button"
              role="menuitem"
              aria-haspopup="menu"
              whileTap={motionOk ? { scale: pressScale } : undefined}
              /* Hover only takes over while a menu is already open, so the row
                 is not a minefield when nothing is expanded. */
              onPointerEnter={() => setOpen((cur) => (cur ? section.id : cur))}
              className={cn(
                "inline-flex h-8 items-center rounded-control px-2.5 text-body font-medium outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                open === section.id
                  ? "bg-hover text-text"
                  : "text-text-2 hover:bg-hover hover:text-text"
              )}
            >
              {section.label}
            </motion.button>
          }
        >
          {section.content}
        </Menu>
      ))}
    </div>
  );
}
