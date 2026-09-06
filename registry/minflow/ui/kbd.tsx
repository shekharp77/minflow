import * as React from "react";
import { cn } from "@/lib/utils";

/*
 * A keycap for inline shortcuts. It stays text-sized so it can sit inside a
 * sentence, while the quiet fill and hairline edge keep it recognisable as a
 * physical key rather than another word.
 */
export interface KbdProps extends React.ComponentProps<"kbd"> {}

export function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-control border border-border-strong bg-bg-2 px-1 font-mono text-caption font-medium leading-none text-text-2",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
