import * as React from "react";
import { cn } from "@/lib/utils";

/*
 * Inline keycap for keyboard shortcuts. It stays text-sized, but carries just
 * enough surface and edge to read as a physical key in a sentence.
 */
export type KbdProps = React.ComponentProps<"kbd">;

export function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex min-h-5 items-center justify-center rounded-control border border-border-strong bg-bg-2 px-1.5 font-mono text-caption font-medium leading-none text-text shadow-[inset_0_-1px_0_color-mix(in_oklab,var(--text)_12%,transparent)]",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
