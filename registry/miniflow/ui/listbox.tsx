"use client";

import * as React from "react";
import { motion } from "motion/react";
import { draw } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Listbox: options visible in a scrollable control, multi-select by default.
 * A list field, so it keeps a hairline boundary all the way around and no
 * fill inside it. Each toggle draws or erases its check.
 */
export interface ListboxProps {
  options: string[];
  multiple?: boolean;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  label?: string;
  className?: string;
}

export function Listbox({
  options,
  multiple = true,
  value,
  defaultValue,
  onValueChange,
  label,
  className,
}: ListboxProps) {
  const [internal, setInternal] = React.useState<string[]>(defaultValue ?? []);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  const toggle = (option: string) => {
    let next: string[];
    if (current.includes(option)) {
      next = current.filter((o) => o !== option);
    } else {
      next = multiple ? [...current, option] : [option];
    }
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  };

  return (
    <ul
      role="listbox"
      aria-multiselectable={multiple}
      aria-label={label}
      className={cn(
        "max-h-44 w-56 overflow-auto overscroll-contain rounded-control border border-border bg-transparent p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {options.map((option) => {
        const selected = current.includes(option);
        return (
          <li key={option}>
            <button
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => toggle(option)}
              className={cn(
                "flex h-8 w-full items-center justify-between rounded-control px-2 text-body text-text outline-none transition-colors duration-150 hover:bg-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
                selected && "font-medium"
              )}
            >
              {option}
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
                    pathLength: selected ? 1 : 0,
                    opacity: selected ? 1 : 0,
                  }}
                  transition={draw}
                />
              </svg>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
