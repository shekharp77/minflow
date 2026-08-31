"use client";

import * as React from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Lock, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { blurRise, durations, easeEnter, easeSoft, useMotionEnabled } from "@/lib/motion";

/*
 * Frames for showing an interface inside the thing it runs on.
 *
 * A frame is the one place this library draws a box on purpose: here the
 * outline is not grouping content, it *is* the content - it says "phone", and
 * without it the screenshot is just a screenshot. So the bezel is a hairline
 * and nothing more; no gradients, no shadows pretending to be glass, no
 * coloured window dots. Everything that survives carries meaning: the status
 * bar tells you it is a phone, the address pill tells you it is a browser.
 */

export type DeviceKind = "phone" | "tablet" | "browser";

export interface DeviceMockupProps {
  kind?: DeviceKind;
  /** Browser only: the address shown in the pill. */
  url?: string;
  /** Phone and tablet only: the status-bar clock. */
  time?: string;
  /** Slow idle drift, for a hero. Off by default - it is distracting in docs. */
  float?: boolean;
  /** Overrides the frame's natural width. Always caps at the container. */
  width?: number;
  children?: React.ReactNode;
  className?: string;
}

const NATURAL: Record<DeviceKind, { width: number; ratio: string }> = {
  phone: { width: 264, ratio: "9 / 19.5" },
  tablet: { width: 420, ratio: "4 / 5.4" },
  browser: { width: 560, ratio: "16 / 10" },
};

export function DeviceMockup({
  kind = "phone",
  url = "minflow.design",
  time = "9:41",
  float = false,
  width,
  children,
  className,
}: DeviceMockupProps) {
  const motionOn = useMotionEnabled();
  const natural = NATURAL[kind];

  return (
    <motion.div
      variants={blurRise}
      initial={motionOn ? "hidden" : false}
      animate="visible"
      /* Motion off: land on the resting state instead of playing the entrance.
         `initial` alone cannot carry this, because it is read once at mount
         and the preference is only known a render later. */
      transition={motionOn ? undefined : { duration: 0 }}
      style={{ width: width ?? natural.width, maxWidth: "100%" }}
      className={cn("shrink-0", className)}
    >
      <motion.div
        animate={
          motionOn && float ? { y: [0, -6, 0] } : undefined
        }
        transition={
          motionOn && float
            ? { duration: durations.ambient, repeat: Infinity, ease: easeSoft }
            : undefined
        }
        style={{ aspectRatio: natural.ratio }}
        className={cn(
          "relative flex w-full flex-col overflow-hidden border border-border-strong bg-bg",
          kind === "phone" && "rounded-[2rem] p-2",
          kind === "tablet" && "rounded-[1.25rem] p-2.5",
          kind === "browser" && "rounded-overlay"
        )}
      >
        {kind === "browser" ? <BrowserBar url={url} /> : null}

        <div
          className={cn(
            "relative flex min-h-0 flex-1 flex-col overflow-hidden bg-bg",
            kind === "phone" && "rounded-[1.5rem]",
            kind === "tablet" && "rounded-[0.75rem]"
          )}
        >
          {kind !== "browser" ? <StatusBar time={time} compact={kind === "phone"} /> : null}
          <div className="min-h-0 flex-1 overflow-auto">{children}</div>
          {kind === "phone" ? (
            /* Home indicator. Load-bearing: it is what makes the frame read as
               a modern phone rather than a rounded rectangle. */
            <div className="flex h-4 shrink-0 items-center justify-center">
              <span aria-hidden className="h-1 w-24 rounded-full bg-fg-2/40" />
            </div>
          ) : null}
        </div>

        {kind === "phone" ? (
          <span
            aria-hidden
            className="absolute left-1/2 top-3.5 h-5 w-20 -translate-x-1/2 rounded-full bg-fg"
          />
        ) : null}
        {kind === "tablet" ? (
          <span
            aria-hidden
            className="absolute left-1/2 top-1 size-1.5 -translate-x-1/2 rounded-full bg-fg-2/50"
          />
        ) : null}
      </motion.div>
    </motion.div>
  );
}

/* Phone and tablet status bar. Glyph-free on purpose except the battery, which
   is the only one people actually read. */
function StatusBar({ time, compact }: { time: string; compact: boolean }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-between px-4 text-caption font-medium text-text",
        compact ? "h-9 pt-2" : "h-7"
      )}
    >
      <span className={compact ? "ml-1" : ""}>{time}</span>
      <span aria-hidden className="flex items-center gap-1">
        <Signal />
        <Battery />
      </span>
    </div>
  );
}

function Signal() {
  return (
    <svg viewBox="0 0 16 10" className="h-2.5 w-4" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={i * 4}
          y={7 - i * 2.2}
          width="2.5"
          height={3 + i * 2.2}
          rx="0.8"
          fill="currentColor"
          opacity={i === 3 ? 0.35 : 1}
        />
      ))}
    </svg>
  );
}

function Battery() {
  return (
    <svg viewBox="0 0 26 12" className="h-3 w-6" aria-hidden>
      <rect
        x="0.6"
        y="0.6"
        width="21"
        height="10.8"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="1.2"
      />
      <rect x="2.4" y="2.4" width="14" height="7.2" rx="1.6" fill="currentColor" />
      <path
        d="M23.4 4.2v3.6a2.2 2.2 0 0 0 0-3.6Z"
        fill="currentColor"
        fillOpacity="0.4"
      />
    </svg>
  );
}

/* Browser chrome. An address is information; three coloured dots are not. */
function BrowserBar({ url }: { url: string }) {
  const motionOn = useMotionEnabled();
  return (
    <div className="flex h-10 shrink-0 items-center gap-1 px-2">
      <span aria-hidden className="flex text-fg-2/50 [&_svg]:size-4">
        <ChevronLeft />
        <ChevronRight />
      </span>
      <motion.span
        initial={motionOn ? { opacity: 0, scaleX: 0.9 } : false}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: durations.view, ease: easeEnter, delay: 0.1 }}
        className="ml-1 flex h-6 min-w-0 flex-1 origin-left items-center gap-1.5 rounded-full bg-bg-2 px-2.5 text-caption text-text-2 [&_svg]:size-3 [&_svg]:shrink-0"
      >
        <Lock aria-hidden className="text-fg-2" />
        <span className="truncate">{url}</span>
      </motion.span>
      <span aria-hidden className="flex text-fg-2/50 [&_svg]:size-4">
        <RotateCw />
      </span>
    </div>
  );
}
