"use client";

import * as React from "react";
import { motion } from "motion/react";
import { enter } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * 2D-matrix input: one drag sets two parameters at once. A crosshair
 * follows the dot so both axis positions stay readable, and the values
 * print live beneath the pad.
 */
export interface MatrixPadProps {
  value?: { x: number; y: number };
  defaultValue?: { x: number; y: number };
  onValueChange?: (value: { x: number; y: number }) => void;
  xLabel?: string;
  yLabel?: string;
  className?: string;
}

export function MatrixPad({
  value,
  defaultValue,
  onValueChange,
  xLabel = "x",
  yLabel = "y",
  className,
}: MatrixPadProps) {
  const [internal, setInternal] = React.useState(
    defaultValue ?? { x: 50, y: 50 }
  );
  const isControlled = value !== undefined;
  const val = isControlled ? value : internal;
  const [active, setActive] = React.useState(false);
  const padRef = React.useRef<HTMLDivElement>(null);

  const commit = (x: number, y: number) => {
    const next = {
      x: Math.round(Math.min(100, Math.max(0, x))),
      y: Math.round(Math.min(100, Math.max(0, y))),
    };
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  };

  const fromEvent = (event: React.PointerEvent) => {
    const rect = padRef.current?.getBoundingClientRect();
    if (!rect) return;
    commit(
      ((event.clientX - rect.left) / rect.width) * 100,
      (1 - (event.clientY - rect.top) / rect.height) * 100
    );
  };

  return (
    <div className={cn("inline-flex flex-col gap-2", className)}>
      <div
        ref={padRef}
        role="application"
        aria-label={`${xLabel} and ${yLabel} pad`}
        tabIndex={0}
        onKeyDown={(event) => {
          const d = event.shiftKey ? 10 : 2;
          if (event.key === "ArrowRight") commit(val.x + d, val.y);
          else if (event.key === "ArrowLeft") commit(val.x - d, val.y);
          else if (event.key === "ArrowUp") commit(val.x, val.y + d);
          else if (event.key === "ArrowDown") commit(val.x, val.y - d);
          else return;
          event.preventDefault();
        }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          setActive(true);
          fromEvent(event);
        }}
        onPointerMove={(event) => {
          if (active) fromEvent(event);
        }}
        onPointerUp={() => setActive(false)}
        onPointerCancel={() => setActive(false)}
        className="relative size-36 cursor-crosshair touch-none select-none overflow-hidden rounded-overlay bg-bg-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span
          aria-hidden
          style={{ left: `${val.x}%` }}
          className="absolute inset-y-0 w-px bg-border-strong"
        />
        <span
          aria-hidden
          style={{ top: `${100 - val.y}%` }}
          className="absolute inset-x-0 h-px bg-border-strong"
        />
        <motion.span
          aria-hidden
          animate={{ scale: active ? 1.3 : 1 }}
          transition={enter}
          style={{ left: `${val.x}%`, top: `${100 - val.y}%` }}
          className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg"
        />
      </div>
      <span className="text-caption text-text-2 tabular-nums">
        {xLabel} {val.x}, {yLabel} {val.y}
      </span>
    </div>
  );
}
