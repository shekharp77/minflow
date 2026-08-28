"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Plus } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Menu } from "@/components/ui/menu";
import { FieldChevron } from "@/registry/miniflow/ui/field";
import { morph, roll } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Property panel: open definition rows on the canvas, no card chrome.
 * Unset values render as muted placeholders that are themselves the
 * click-to-edit affordance; completeness is incremental.
 */
export interface PropertyProps {
  label: string;
  icon?: React.ReactNode;
  /** Renders the value as a quiet add-affordance. */
  muted?: boolean;
  onClick?: () => void;
  /**
   * Menu items. Turns the value into a dropdown trigger, which is how a
   * property with a fixed set of possible values gets edited in place.
   */
  menu?: React.ReactNode;
  children: React.ReactNode;
}

const valueRow =
  "flex min-h-6 min-w-0 items-center gap-2 rounded-control text-left text-body outline-none transition-colors duration-150 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-fg-2";
const valueInteractive =
  "cursor-pointer hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function Property({
  label,
  icon,
  muted,
  onClick,
  menu,
  children,
}: PropertyProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="grid h-8 grid-cols-[88px_1fr] items-center gap-3">
      <span className="text-caption text-text-2">{label}</span>
      {menu ? (
        <Menu
          align="start"
          open={open}
          onOpenChange={setOpen}
          trigger={
            <button
              type="button"
              aria-haspopup="menu"
              className={cn(
                valueRow,
                valueInteractive,
                muted ? "text-text-2" : "text-text"
              )}
            >
              {icon}
              {children}
              <FieldChevron open={open} />
            </button>
          }
        >
          {menu}
        </Menu>
      ) : onClick ? (
        <button
          type="button"
          onClick={onClick}
          className={cn(
            valueRow,
            valueInteractive,
            muted ? "text-text-2" : "text-text"
          )}
        >
          {icon}
          {children}
        </button>
      ) : (
        <span className={cn(valueRow, muted ? "text-text-2" : "text-text")}>
          {icon}
          {children}
        </span>
      )}
    </div>
  );
}

export interface PropertyListProps {
  title?: string;
  onAdd?: () => void;
  className?: string;
  children: React.ReactNode;
}

export function PropertyList({
  title = "Properties",
  onAdd,
  className,
  children,
}: PropertyListProps) {
  const [open, setOpen] = React.useState(true);

  return (
    <div className={cn("w-72", className)}>
      <div className="flex items-center">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-6 items-center gap-1 rounded-control text-caption font-medium text-text-2 outline-none transition-colors duration-150 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {title}
          <motion.span
            aria-hidden
            initial={false}
            animate={{ rotate: open ? 0 : -90 }}
            transition={roll}
          >
            <ChevronDown className="size-4" />
          </motion.span>
        </button>
        {onAdd && (
          <IconButton label="Add property" className="ml-auto size-8" onClick={onAdd}>
            <Plus />
          </IconButton>
        )}
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={morph}
            className="overflow-hidden"
          >
            <div className="flex flex-col pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
