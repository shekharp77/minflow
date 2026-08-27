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
 */
export function Tooltip({ label, side = "top", className, children }: TooltipProps) {
  return (
    <span className="group/tooltip relative inline-flex">
      {children}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-overlay bg-fg px-2 py-1 text-caption font-medium text-bg opacity-0 shadow-overlay transition-all duration-300 ease-out",
          side === "top"
            ? "bottom-full mb-1.5 translate-y-0.5"
            : "top-full mt-1.5 -translate-y-0.5",
          "group-focus-within/tooltip:translate-y-0 group-focus-within/tooltip:opacity-100 group-hover/tooltip:translate-y-0 group-hover/tooltip:opacity-100",
          className
        )}
      >
        {label}
      </span>
    </span>
  );
}
