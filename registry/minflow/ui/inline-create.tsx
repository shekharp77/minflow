"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Ellipsis, Plus } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Menu } from "@/components/ui/menu";
import { Input } from "@/registry/minflow/ui/input";
import { enter, exit, morph } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Inline creation: the object is made where it will live, never in a modal
 * and never behind a Create button. Three states, one row, morphing in place.
 *
 *   1. Rest      a ghost "+ Noun" sitting exactly where the new row will be.
 *   2. Draft     the ghost becomes the row: one focused field asking only for
 *                the name, with the object's other slots already beside it,
 *                muted and inert, previewing what can be filled in later.
 *                Enter commits, Escape dissolves it.
 *   3. Committed the object exists on defaults, and every empty slot is now a
 *                muted placeholder that is itself the click-to-edit control.
 *
 * The field inside carries no border in any state. The row's own hover fill
 * and the placeholder are the entire affordance.
 */
export interface InlineCreateProps {
  /** The object noun, as it appears in the ghost row: "+ Milestone". */
  noun: string;
  /** Placeholder for the one mandatory field. Defaults to "<Noun> name". */
  placeholder?: string;
  /** Glyph shown at the head of the row, in both draft and committed state. */
  icon?: React.ReactNode;
  /**
   * The object's other slots, muted and inert while drafting. A preview of
   * what exists, never inputs that gate creation.
   */
  slots?: React.ReactNode;
  /** Secondary line under the row, e.g. a description field. */
  detail?: React.ReactNode;
  /** Row actions on the committed object, behind a handle that appears on hover. */
  menu?: React.ReactNode;
  onCreate?: (name: string) => void;
  className?: string;
}

export function InlineCreate({
  noun,
  placeholder,
  icon,
  slots,
  detail,
  menu,
  onCreate,
  className,
}: InlineCreateProps) {
  const [drafting, setDrafting] = React.useState(false);
  const [name, setName] = React.useState("");
  const [committed, setCommitted] = React.useState<string | null>(null);

  const commit = () => {
    const value = name.trim();
    if (!value) return dissolve();
    setCommitted(value);
    setName("");
    setDrafting(false);
    onCreate?.(value);
  };

  const dissolve = () => {
    setName("");
    setDrafting(false);
  };

  const row = "group/row flex h-8 items-center gap-2 rounded-control px-2";

  return (
    <div className={cn("flex w-full flex-col", className)}>
      {/* Committed object, on defaults, with its slots now editable in place. */}
      <AnimatePresence initial={false}>
        {committed && (
          <motion.div
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto", transition: enter }}
            exit={{ opacity: 0, height: 0, transition: exit }}
            className="overflow-hidden"
          >
            <div className={cn(row, "hover:bg-hover")}>
              <span aria-hidden className="shrink-0 text-fg-2 [&_svg]:size-4">
                {icon}
              </span>
              <span className="truncate text-body font-medium text-text">
                {committed}
              </span>
              <span className="ml-auto flex items-center gap-3 text-caption text-text-2">
                {slots}
              </span>
              {menu && (
                <Menu
                  align="end"
                  trigger={
                    <IconButton
                      label={`Actions for ${committed}`}
                      className="size-6 shrink-0 opacity-0 transition-opacity duration-150 group-hover/row:opacity-100"
                    >
                      <Ellipsis />
                    </IconButton>
                  }
                >
                  {menu}
                </Menu>
              )}
            </div>
            {detail && <div className="px-2 pb-1">{detail}</div>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rest and draft occupy the same slot, so the ghost morphs in place. */}
      <motion.div layout transition={morph}>
        <AnimatePresence mode="wait" initial={false}>
          {drafting ? (
            <motion.div
              key="draft"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: enter }}
              exit={{ opacity: 0, transition: exit }}
            >
              <div className={cn(row, "bg-hover")}>
                <span aria-hidden className="shrink-0 text-fg-2 [&_svg]:size-4">
                  {icon}
                </span>
                {/*
                  * Focus on mount, not on a timer: the ghost's exit runs
                  * first under mode="wait", so this input does not exist yet
                  * when the click that opened the draft returns.
                  */}
                <Input
                  autoFocus
                  value={name}
                  placeholder={placeholder ?? `${noun} name`}
                  aria-label={placeholder ?? `${noun} name`}
                  onChange={(event) => setName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      commit();
                    } else if (event.key === "Escape") {
                      event.preventDefault();
                      dissolve();
                    }
                  }}
                  onBlur={commit}
                  className="h-8"
                />
                <span className="ml-auto flex shrink-0 items-center gap-3 text-caption text-text-2/70">
                  {slots}
                </span>
              </div>
              {detail && <div className="px-2 pt-1">{detail}</div>}
            </motion.div>
          ) : (
            <motion.button
              key="ghost"
              type="button"
              onClick={() => setDrafting(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: enter }}
              exit={{ opacity: 0, transition: exit }}
              className={cn(
                row,
                "w-full text-left text-body text-text-2 opacity-45 transition-opacity duration-150 outline-none hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
              )}
            >
              <Plus aria-hidden className="size-4 shrink-0" />
              {noun}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
