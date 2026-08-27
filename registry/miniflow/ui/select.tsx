"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { useDismiss } from "@/components/ui/overlay";
import {
  FieldBoundary,
  FieldChevron,
  FieldValue,
  fieldBoxRow,
} from "@/registry/miniflow/ui/field";
import { draw, fadeRise, panel } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Dropdown list: one value from a hidden list. Wears the shared field chrome,
 * so at rest it is a rule, a placeholder, and a chevron. Opening rolls the
 * chevron, sweeps the accent rule in, drops the panel out of the trigger, and
 * cascades the options; the chosen row's check draws itself.
 */
export interface SelectOption {
  value: string;
  label: React.ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select...",
  label,
  className,
}: SelectProps) {
  const [internal, setInternal] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;
  const [open, setOpen] = React.useState(false);
  const [hi, setHi] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => setOpen(false), []);
  useDismiss(open, close, [rootRef]);

  const selected = options.find((o) => o.value === current);

  const choose = (v: string) => {
    if (!isControlled) setInternal(v);
    onValueChange?.(v);
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setHi(Math.max(0, options.findIndex((o) => o.value === current)));
        setOpen(true);
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHi((h) => Math.min(options.length - 1, h + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHi((h) => Math.max(0, h - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = options[hi];
      if (target) choose(target.value);
    }
  };

  return (
    <div ref={rootRef} className={cn("relative w-44", className)} onKeyDown={onKeyDown}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className={cn(fieldBoxRow, "border border-border")}
      >
        <FieldValue filled={!!selected}>
          {selected?.label ?? placeholder}
        </FieldValue>
        <FieldChevron open={open} />
        <FieldBoundary active={open} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            variants={panel(0.045)}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ transformOrigin: "top left" }}
            className="absolute top-full z-50 mt-2 w-full rounded-overlay bg-bg-2 p-1 shadow-overlay ring-1 ring-border"
          >
            {options.map((option, index) => {
              const isSelected = option.value === current;
              return (
                <motion.li key={option.value} variants={fadeRise}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => choose(option.value)}
                    onMouseEnter={() => setHi(index)}
                    className={cn(
                      "flex h-8 w-full items-center justify-between rounded-control px-2 text-body text-text outline-none transition-colors duration-150",
                      hi === index && "bg-hover"
                    )}
                  >
                    {option.label}
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      strokeWidth={1.75}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-3.5 stroke-fg"
                    >
                      <motion.path
                        d="M3.5 8.5 6.5 11.5 12.5 4.5"
                        initial={false}
                        animate={{
                          pathLength: isSelected ? 1 : 0,
                          opacity: isSelected ? 1 : 0,
                        }}
                        transition={draw}
                      />
                    </svg>
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
