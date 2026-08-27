"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Search, X } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { FieldBoundary } from "@/registry/miniflow/ui/field";
import { morph, roll } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Search that starts as a single glyph and eases open into a field on
 * focus. Empty blur folds it closed again; the X clears and refocuses.
 */
export interface SearchFieldProps {
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function SearchField({
  placeholder = "Search",
  value,
  onValueChange,
  className,
}: SearchFieldProps) {
  const [internal, setInternal] = React.useState("");
  const isControlled = value !== undefined;
  const query = isControlled ? value : internal;
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const set = (v: string) => {
    if (!isControlled) setInternal(v);
    onValueChange?.(v);
  };

  return (
    <motion.div
      animate={{ width: open ? 224 : 40 }}
      transition={morph}
      className={cn(
        "relative flex h-10 items-center overflow-hidden rounded-control",
        className
      )}
    >
      <FieldBoundary active={open} />
      <IconButton
        label="Search"
        tabIndex={open ? -1 : 0}
        onClick={() => {
          setOpen(true);
          window.setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="shrink-0"
      >
        <Search />
      </IconButton>
      <motion.input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        aria-label={placeholder}
        value={query}
        animate={{ opacity: open ? 1 : 0 }}
        transition={roll}
        onChange={(event) => set(event.target.value)}
        onBlur={() => {
          if (!query) setOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            set("");
            setOpen(false);
            inputRef.current?.blur();
          }
        }}
        className="w-full bg-transparent pr-8 font-sans text-body text-text outline-none placeholder:text-text-2/70"
      />
      {open && query && (
        <IconButton
          label="Clear"
          size={16}
          onClick={() => {
            set("");
            inputRef.current?.focus();
          }}
          className="absolute right-0 size-8"
        >
          <X />
        </IconButton>
      )}
    </motion.div>
  );
}
