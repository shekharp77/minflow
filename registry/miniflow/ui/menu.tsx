"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { Popover } from "@/components/ui/popover";
import {
  cascade,
  fadeRise,
  panel,
  pressScale,
  roll,
  useMotionEnabled,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Menu family: dropdown menu, sections, submenu flyout. Items close their
 * menu on select through context, so every composition behaves. The items
 * cascade in behind the panel rather than arriving with it, which is what
 * makes a menu read as a list you can run your eye down.
 *
 * That cascade is deliberately tight. A menu is a target: the reader is
 * already moving toward a row before it has finished arriving, and a row still
 * travelling under the cursor is a mis-click. The stagger buys legibility only
 * for as long as it stays under the time it takes to aim.
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
          variants={cascade(0.022)}
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

const menuRow =
  "flex h-8 w-full items-center gap-2 rounded-control px-2 text-left text-body text-text outline-none transition-colors duration-150 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-fg-2";

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
  const motionOk = useMotionEnabled();
  return (
    <motion.button
      variants={fadeRise}
      type="button"
      role="menuitem"
      /*
       * The row is already carrying the cascade's y-drift on `variants`, so a
       * press cannot animate `scale` through the same `animate` channel
       * without the two fighting. `whileTap` is a separate gesture channel and
       * composes cleanly over the variant.
       */
      whileTap={motionOk ? { scale: pressScale } : undefined}
      onClick={() => {
        onSelect?.();
        close();
      }}
      className={cn(
        menuRow,
        "hover:bg-hover focus-visible:bg-hover disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {icon}
      {children}
    </motion.button>
  );
}

/*
 * How long a pointer must rest on a parent row before its flyout opens, and
 * how long the flyout survives after the pointer leaves.
 *
 * The open delay exists because a menu is mostly crossed, not aimed at: without
 * it, running the cursor down a list flashes a panel for every submenu on the
 * way past. The close delay is longer than the open delay on purpose -- it is
 * the forgiveness that lets the reader cut the corner diagonally toward the
 * flyout instead of tracing an L along the row.
 */
const SUBMENU_OPEN_MS = 120;
const SUBMENU_CLOSE_MS = 260;

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
  const [open, setOpen] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);

  const schedule = React.useCallback((next: boolean) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => setOpen(next),
      next ? SUBMENU_OPEN_MS : SUBMENU_CLOSE_MS
    );
  }, []);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <div
      className="group/sub relative"
      onPointerEnter={() => schedule(true)}
      onPointerLeave={() => schedule(false)}
      onFocus={() => {
        window.clearTimeout(timer.current);
        setOpen(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          schedule(false);
        }
      }}
    >
      <div
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={open}
        tabIndex={0}
        className={cn(
          menuRow,
          "cursor-default focus-visible:bg-hover",
          open && "bg-hover"
        )}
      >
        {icon}
        {label}
        <motion.span
          className="ml-auto flex"
          animate={{ x: open ? 2 : 0 }}
          transition={roll}
        >
          <ChevronRight aria-hidden />
        </motion.span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            variants={panel(0.018)}
            initial="hidden"
            animate="visible"
            exit="exit"
            /*
             * The flyout grows out of the edge it is attached to, so the eye
             * is told where it came from rather than having to find it.
             */
            style={{ transformOrigin: "top left" }}
            className="absolute left-full top-0 z-50 ml-1 min-w-40 rounded-overlay bg-bg-2 p-1 shadow-overlay ring-1 ring-border"
          >
            {/* Rows inherit the panel's variant state directly: MenuItem is
                itself a motion element carrying `fadeRise`, so no wrapper is
                needed -- and a role-less div here would sever the ARIA
                ownership between role="menu" and its role="menuitem" rows. */}
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
