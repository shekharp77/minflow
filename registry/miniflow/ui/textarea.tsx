"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/*
 * Textbox for longer text that grows with its content: height follows
 * scrollHeight through a CSS transition, so new lines ease the field open
 * instead of jumping it. Inline like every other field, so it never draws a
 * boundary: the placeholder is the whole affordance.
 */
export interface TextareaProps extends React.ComponentProps<"textarea"> {
  maxRows?: number;
}

export function Textarea({
  className,
  maxRows = 8,
  onInput,
  ...props
}: TextareaProps) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  const grow = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const line = 20; /* text-body line height in px */
    const max = maxRows * line + 16;
    el.style.height = "0px";
    el.style.height = `${Math.min(max, el.scrollHeight)}px`;
  }, [maxRows]);

  React.useEffect(() => {
    grow();
  }, [grow]);

  return (
    <textarea
      ref={ref}
      rows={2}
      onInput={(event) => {
        grow();
        onInput?.(event);
      }}
      className={cn(
        "w-full min-w-0 resize-none overflow-hidden bg-transparent py-1 font-sans text-body text-text outline-none transition-[height] duration-150 placeholder:text-text-2/70 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
