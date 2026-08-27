import * as React from "react";
import { cn } from "@/lib/utils";

/*
 * Skeleton screen: the page's wireframe while it loads, with one quiet
 * light sweep. Compose shapes to sketch the real layout.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative block overflow-hidden rounded-control bg-hover",
        className
      )}
    >
      <span className="absolute inset-0 animate-[shimmer_1.8s_ease-in-out_infinite] bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--text)_7%,transparent),transparent)]" />
    </span>
  );
}
