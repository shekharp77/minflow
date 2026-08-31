"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, Ellipsis } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Menu } from "@/components/ui/menu";
import { enter, exit as exitT, morph, pressScale, roll, useMotionEnabled } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Tree: a proper disclosure tree. Parents carry an always-visible chevron
 * that rolls a quarter turn, leaves keep the alignment slot, each level
 * hangs off its own hairline guide, and branches ease open with a cascade.
 *
 * A node may carry a `menu` of row actions. Its handle stays invisible until
 * the row is hovered or focused, so a deep tree reads as labels rather than as
 * a column of buttons, and it stays put once its menu is open.
 */
export interface TreeNode {
  id: string;
  label: string;
  icon?: React.ReactNode;
  /** Row actions. Rendered behind a handle that appears on hover. */
  menu?: React.ReactNode;
  children?: TreeNode[];
}

export interface TreeProps {
  items: TreeNode[];
  defaultExpanded?: string[];
  defaultSelected?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export function Tree({
  items,
  defaultExpanded = [],
  defaultSelected,
  onSelect,
  className,
}: TreeProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(
    () => new Set(defaultExpanded)
  );
  const [selected, setSelected] = React.useState(defaultSelected);
  const [menuFor, setMenuFor] = React.useState<string | null>(null);
  const motionOk = useMotionEnabled();

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const renderNodes = (nodes: TreeNode[], depth: number) => (
    <ul role={depth === 0 ? "tree" : "group"} className="flex flex-col gap-0.5">
      {nodes.map((node) => {
        const hasChildren = !!node.children?.length;
        const open = expanded.has(node.id);
        return (
          <li
            key={node.id}
            role="treeitem"
            aria-expanded={hasChildren ? open : undefined}
            aria-selected={selected === node.id}
          >
            <div
              className={cn(
                "group/row flex h-8 items-center gap-1.5 rounded-control px-1.5 transition-colors duration-150",
                selected === node.id
                  ? "bg-hover font-medium text-text"
                  : "text-text-2 hover:bg-hover/60 hover:text-text"
              )}
            >
              <motion.button
                type="button"
                whileTap={motionOk ? { scale: pressScale } : undefined}
                onClick={() => {
                  setSelected(node.id);
                  onSelect?.(node.id);
                  if (hasChildren) toggle(node.id);
                }}
                className="flex min-h-6 min-w-0 flex-1 items-center gap-1.5 rounded-control text-left text-body outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
              >
                {hasChildren ? (
                  <motion.span
                    aria-hidden
                    initial={false}
                    animate={{ rotate: open ? 90 : 0 }}
                    transition={roll}
                    className="flex size-4 shrink-0 items-center justify-center text-fg-2"
                  >
                    <ChevronRight className="size-4" />
                  </motion.span>
                ) : (
                  <span aria-hidden className="size-4 shrink-0" />
                )}
                <span
                  aria-hidden
                  className="flex size-4 shrink-0 items-center justify-center text-fg-2 [&_svg]:size-4"
                >
                  {node.icon}
                </span>
                <span className="truncate">{node.label}</span>
              </motion.button>
              {node.menu && (
                <Menu
                  align="end"
                  open={menuFor === node.id}
                  onOpenChange={(v) => setMenuFor(v ? node.id : null)}
                  trigger={
                    <IconButton
                      label={`Actions for ${node.label}`}
                      className={cn(
                        "size-6 shrink-0 transition-opacity duration-150",
                        menuFor === node.id
                          ? "opacity-100"
                          : "opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100"
                      )}
                    >
                      <Ellipsis />
                    </IconButton>
                  }
                >
                  {node.menu}
                </Menu>
              )}
            </div>
            <AnimatePresence initial={false}>
              {hasChildren && open && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={morph}
                  className="overflow-hidden"
                >
                  {/*
                    The branch line draws down from the parent as the children
                    appear, so an expanding node reads as the tree growing a
                    limb rather than a block of rows being inserted.
                  */}
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0, transition: { ...enter, delay: 0.03 } }}
                    exit={{ opacity: 0, transition: exitT }}
                    className="relative ml-[13px] mt-0.5 pl-3.5"
                  >
                    <motion.span
                      aria-hidden
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1, transition: morph }}
                      exit={{ scaleY: 0, transition: exitT }}
                      className="absolute bottom-1 left-0 top-0 w-px origin-top bg-border"
                    />
                    {renderNodes(node.children!, depth + 1)}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );

  return (
    <nav className={cn("w-64 select-none", className)}>
      {renderNodes(items, 0)}
    </nav>
  );
}
