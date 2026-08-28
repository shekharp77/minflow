"use client";

import * as React from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { enter, exit, roll } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Shared chrome for field-shaped controls, in two registers.
 *
 * Inline fields draw nothing, ever: no fill, no box, no rule, not even on
 * focus. A placeholder, an optional leading glyph, and a trailing action once
 * there is something to act on. Their chrome lives in this file only by
 * absence, which is deliberate; anything that outlines an inline field is a
 * defect, not a variant.
 *
 * List fields (select, combo box, date picker, search) do the opposite: they
 * keep a permanent boundary all the way around, because a closed list has to
 * look clickable while empty. The boundary is a hairline and never a fill.
 */

/** List-field row: hairline boundary, transparent inside. */
export const fieldBoxRow =
  "relative flex h-8 w-full items-center justify-between gap-2 rounded-control bg-transparent px-2.5 text-left text-body outline-none";

/** The permanent boundary for list fields. Deepens while the list is open. */
export function FieldBoundary({
  active,
  invalid,
}: {
  active: boolean;
  invalid?: boolean;
}) {
  return (
    <motion.span
      aria-hidden
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={roll}
      className={cn(
        "pointer-events-none absolute inset-0 rounded-control border",
        invalid ? "border-err" : "border-control-edge"
      )}
    />
  );
}

/** Secondary-toned chevron that rolls over while its list is open. */
export function FieldChevron({ open }: { open: boolean }) {
  return (
    <motion.span
      aria-hidden
      initial={false}
      animate={{ rotate: open ? 180 : 0 }}
      transition={roll}
      className="shrink-0 text-fg-2"
    >
      <ChevronDown className="size-4" />
    </motion.span>
  );
}

/** Value slot: primary text once set, secondary while it is still a prompt. */
export function FieldValue({
  filled,
  children,
}: {
  filled: boolean;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("truncate", filled ? "text-text" : "text-text-2")}>
      {children}
    </span>
  );
}
