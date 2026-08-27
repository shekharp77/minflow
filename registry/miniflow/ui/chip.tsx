"use client";

import * as React from "react";
import { motion } from "motion/react";
import { fadeScale } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Enumerated values (status, role, tier, category) always render as chips,
 * never as plain text. Status tones mean status and nothing else; identity
 * tones attach to a data type app-wide, never to an instance's mood.
 *
 * A chip settles in when it appears, because a value arriving on a row is a
 * change worth noticing, and it crossfades when its tone changes rather than
 * swapping colour on the spot.
 */
export type ChipTone = "neutral" | "ok" | "warn" | "err" | "id1" | "id2" | "id3";
export type ChipVariant = "tint" | "outline";

const tint: Record<ChipTone, string> = {
  neutral: "bg-hover text-text-2",
  ok: "bg-ok/12 text-ok",
  warn: "bg-warn/12 text-warn",
  err: "bg-err/12 text-err",
  id1: "bg-id-1/12 text-id-1",
  id2: "bg-id-2/12 text-id-2",
  id3: "bg-id-3/12 text-id-3",
};

const outline: Record<ChipTone, string> = {
  neutral: "border border-border-strong text-text-2",
  ok: "border border-ok/40 text-ok",
  warn: "border border-warn/40 text-warn",
  err: "border border-err/40 text-err",
  id1: "border border-id-1/40 text-id-1",
  id2: "border border-id-2/40 text-id-2",
  id3: "border border-id-3/40 text-id-3",
};

export interface ChipProps
  extends Omit<React.ComponentProps<typeof motion.span>, "children"> {
  tone?: ChipTone;
  variant?: ChipVariant;
  children?: React.ReactNode;
}

export function Chip({
  tone = "neutral",
  variant = "tint",
  className,
  ...props
}: ChipProps) {
  return (
    <motion.span
      data-slot="chip"
      variants={fadeScale}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        "inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-full px-2 text-caption font-medium transition-colors duration-300 [&_svg]:size-3.5 [&_svg]:shrink-0",
        variant === "tint" ? tint[tone] : outline[tone],
        className
      )}
      {...props}
    />
  );
}
