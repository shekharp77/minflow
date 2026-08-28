import * as React from "react";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  label: React.ReactNode;
  side?: "top" | "bottom";
  className?: string;
  children: React.ReactNode;
}

/*
 * CSS-driven hover/focus reveal, so it stays server-renderable. The visual
 * bubble is aria-hidden: icon-only triggers carry their own aria-label, and
 * the tooltip exists to hand the stripped text back to sighted users.
 *
 * The delay is the whole design. A toolbar is crossed far more often than it
 * is aimed at, and without a rest period every icon the cursor passes fires a
 * bubble -- so the reader gets a trail of flashing labels for a journey to
 * somewhere else entirely. The delay applies only on the way in: once the
 * reader has left, the tooltip is already wrong, so it goes immediately.
 */
export function Tooltip({ label, side = "top", className, children }: TooltipProps) {
  return (
    <span className="group/tooltip relative inline-flex">
      {children}
      <span
        aria-hidden
        className={cn(
          /*
           * Enumerated rather than `transition-all`: `all` animates every
           * property that ever changes -- colour, shadow, the lot -- and takes
           * each of them off the compositor to do it.
           */
          "pointer-events-none absolute left-1/2 z-anchored -translate-x-1/2 whitespace-nowrap rounded-overlay bg-fg px-2 py-1 text-caption font-medium text-bg opacity-0 shadow-overlay transition-[opacity,transform] duration-150 ease-out delay-0",
          side === "top"
            ? "bottom-full mb-1.5 translate-y-0.5"
            : "top-full mt-1.5 -translate-y-0.5",
          "group-focus-within/tooltip:translate-y-0 group-focus-within/tooltip:opacity-100 group-hover/tooltip:translate-y-0 group-hover/tooltip:opacity-100",
          /* Delay belongs to the hover state, so it gates opening only. */
          "group-hover/tooltip:delay-500 group-focus-within/tooltip:delay-0",
          className
        )}
      >
        {label}
      </span>
    </span>
  );
}
