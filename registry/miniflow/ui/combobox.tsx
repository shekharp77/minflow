"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Input } from "@/components/ui/input";
import { Portal, useAnchoredPosition, useDismiss } from "@/components/ui/overlay";
import { FieldChevron } from "@/registry/miniflow/ui/field";
import { durations, panel } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Combo box: dropdown list plus textbox, wearing the same field chrome as
 * every other input. Typing filters the list live, and auto-animate reflows
 * the surviving options instead of snapping them.
 */
export interface ComboboxProps {
  options: string[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Search...",
  label,
  className,
}: ComboboxProps) {
  const [selected, setSelected] = React.useState(value ?? "");
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [hi, setHi] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [listRef] = useAutoAnimate<HTMLUListElement>({ duration: durations.view * 1000 });
  const close = React.useCallback(() => setOpen(false), []);
  const panelRef = React.useRef<HTMLDivElement>(null);
  /* Portalled panel: name it here or a click on an option counts as outside. */
  useDismiss(open, close, [rootRef, panelRef]);
  const { style: panelStyle, origin } = useAnchoredPosition(open, rootRef, panelRef, {
    matchWidth: true,
  });

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase())
  );

  const choose = (v: string) => {
    setSelected(v);
    setQuery("");
    setOpen(false);
    onValueChange?.(v);
  };

  return (
    <div ref={rootRef} className={cn("relative w-56", className)}>
      <div className="relative flex items-center">
        <Input
          role="combobox"
          aria-expanded={open}
          aria-label={label ?? placeholder}
          placeholder={placeholder}
          value={open ? query : selected || ""}
          onFocus={() => {
            setQuery("");
            setHi(0);
            setOpen(true);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setHi(0);
            if (!open) setOpen(true);
          }}
          onKeyDown={(event) => {
            if (!open) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setHi((h) => Math.min(filtered.length - 1, h + 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setHi((h) => Math.max(0, h - 1));
            } else if (event.key === "Enter") {
              event.preventDefault();
              if (filtered[hi]) choose(filtered[hi]);
            } else if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          variant="boxed"
          className="pr-6"
        />
        <span className="pointer-events-none absolute right-2.5">
          <FieldChevron open={open} />
        </span>
      </div>
      <Portal>
        <AnimatePresence>
          {open && (
            <motion.div
              ref={panelRef}
              variants={panel()}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ ...panelStyle, transformOrigin: origin }}
              className="z-anchored overflow-y-auto rounded-overlay bg-bg-2 p-1 shadow-overlay ring-1 ring-border"
            >
            <ul ref={listRef} role="listbox">
              {filtered.map((option, index) => (
                <li key={option}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={option === selected}
                    onClick={() => choose(option)}
                    onMouseEnter={() => setHi(index)}
                    className={cn(
                      "flex h-8 w-full items-center rounded-control px-2 text-body text-text transition-colors duration-150",
                      hi === index && "bg-hover",
                      option === selected && "font-medium"
                    )}
                  >
                    {option}
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="flex h-8 items-center px-2 text-caption text-text-2">
                  No matches
                </li>
              )}
            </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </div>
  );
}
