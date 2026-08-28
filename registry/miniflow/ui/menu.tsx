"use client";

import * as React from "react";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { Popover } from "@/components/ui/popover";
import { cascade, fadeRise } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Menu family: dropdown menu, sections, submenu flyout. Items close their
 * menu on select through context, so every composition behaves. The items
 * cascade in behind the panel rather than arriving with it, which is what
 * makes a menu read as a list you can run your eye down.
 */
export const MenuCloseContext = React.createContext<() => void>(() => {});

export interface MenuProps {
  trigger: React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
  side?: "top" | "bottom";
  align?: "start" | "end";
  /** Controlled open state; omit for uncontrolled. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: React.ReactNode;
}

export function Menu({
  trigger,
  side,
  align,
  open: openProp,
  onOpenChange,
  className,
  children,
}: MenuProps) {
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
  const close = React.useCallback(() => setOpen(false), [setOpen]);

  return (
    <MenuCloseContext.Provider value={close}>
      <Popover
        trigger={trigger}
        side={side}
        align={align}
        open={open}
        onOpenChange={setOpen}
        className={cn("min-w-44 p-1", className)}
      >
        {/* The panel needs the role, not just its rows: a `menuitem` outside
            a `menu` is an orphan, and assistive tech announces the group
            wrongly (or not at all). Matters most under Menubar, where the
            triggers are themselves menuitems. */}
        <motion.div
          role="menu"
          variants={cascade(0.045)}
          initial="hidden"
          animate="visible"
        >
          {children}
        </motion.div>
      </Popover>
    </MenuCloseContext.Provider>
  );
}

export function MenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 pb-1 pt-1.5 text-caption font-medium uppercase tracking-[0.08em] text-text-2">
      {children}
    </p>
  );
}

export interface MenuItemProps
  extends Omit<React.ComponentProps<"button">, "onSelect"> {
  icon?: React.ReactNode;
  onSelect?: () => void;
}

export function MenuItem({
  icon,
  onSelect,
  className,
  children,
  ...props
}: MenuItemProps) {
  const close = React.useContext(MenuCloseContext);
  return (
    <motion.button
      variants={fadeRise}
      type="button"
      role="menuitem"
      onClick={() => {
        onSelect?.();
        close();
      }}
      className={cn(
        "flex h-8 w-full items-center gap-2 rounded-control px-2 text-left text-body text-text outline-none transition-colors duration-300 hover:bg-hover focus-visible:bg-hover disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-fg-2",
        className
      )}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {icon}
      {children}
    </motion.button>
  );
}

/* Hover flyout that opens beside its parent item. */
export function Submenu({
  label,
  icon,
  children,
}: {
  label: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="group/sub relative">
      <div
        role="menuitem"
        aria-haspopup="menu"
        tabIndex={0}
        className="flex h-8 w-full cursor-default items-center gap-2 rounded-control px-2 text-body text-text transition-colors duration-300 outline-none group-hover/sub:bg-hover focus-visible:bg-hover [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-fg-2"
      >
        {icon}
        {label}
        <ChevronRight className="ml-auto" aria-hidden />
      </div>
      <div className="invisible absolute left-full top-0 z-50 ml-1 min-w-40 origin-top-left scale-95 rounded-overlay bg-bg-2 p-1 opacity-0 shadow-overlay ring-1 ring-border transition-all duration-300 ease-out group-hover/sub:visible group-hover/sub:scale-100 group-hover/sub:opacity-100 group-focus-within/sub:visible group-focus-within/sub:scale-100 group-focus-within/sub:opacity-100">
        {children}
      </div>
    </div>
  );
}
