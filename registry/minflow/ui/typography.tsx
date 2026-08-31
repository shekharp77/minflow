"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { cascade, fadeRise, useMotionEnabled } from "@/lib/motion";

/*
 * The type scale, as a component.
 *
 * Six sizes, and that is the entire list. A scale this short is a constraint
 * on purpose: every extra size is one more thing that has to be chosen, and
 * hierarchy on a quiet page comes from weight and colour long before it comes
 * from size. When in doubt, take the smaller one.
 *
 * `variant` picks the size; `tone` picks the colour; the element is chosen
 * separately with `as`, so a visually small heading is still an <h2> and the
 * document outline survives the design.
 */
export type TextVariant =
  | "display"
  | "title"
  | "section"
  | "emphasis"
  | "body"
  | "caption";

export type TextTone = "default" | "muted" | "accent" | "ok" | "warn" | "err";

export interface TextProps extends React.ComponentProps<"p"> {
  variant?: TextVariant;
  tone?: TextTone;
  /** Renders the display face (Nunito). Headings only. */
  display?: boolean;
  as?: React.ElementType;
}

const size: Record<TextVariant, string> = {
  display: "text-display font-bold",
  title: "text-title font-semibold",
  section: "text-section font-medium",
  emphasis: "text-emphasis",
  body: "text-body",
  caption: "text-caption",
};

const tones: Record<TextTone, string> = {
  default: "text-text",
  muted: "text-text-2",
  accent: "text-accent",
  ok: "text-ok",
  warn: "text-warn",
  err: "text-err",
};

export function Text({
  variant = "body",
  tone = "default",
  display = false,
  as,
  className,
  ...props
}: TextProps) {
  const Component = (as ?? "p") as React.ElementType;
  return (
    <Component
      className={cn(size[variant], tones[tone], display && "font-display", className)}
      {...props}
    />
  );
}

/** Small-caps section marker. The library's one recurring label style. */
export function Eyebrow({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-caption font-medium uppercase tracking-[0.08em] text-text-2",
        className
      )}
      {...props}
    />
  );
}

const SPECIMEN: { variant: TextVariant; note: string }[] = [
  { variant: "display", note: "Page title. One per page." },
  { variant: "title", note: "Section title inside a page." },
  { variant: "section", note: "Group heading. Medium weight." },
  { variant: "emphasis", note: "Lead paragraph, or a row that matters." },
  { variant: "body", note: "Default. Everything not called out." },
  { variant: "caption", note: "Meta, labels, help text." },
];

/** Renders the whole scale. For documentation and design review. */
export function TypeScale({ className }: { className?: string }) {
  const motionOn = useMotionEnabled();
  return (
    <motion.div
      variants={cascade(0.06)}
      initial={motionOn ? "hidden" : false}
      animate="visible"
      transition={motionOn ? undefined : { duration: 0 }}
      className={cn("flex w-full flex-col gap-5", className)}
    >
      {SPECIMEN.map(({ variant, note }) => (
        <motion.div
          key={variant}
          variants={fadeRise}
          className="flex flex-col gap-0.5"
        >
          <Text variant={variant} display={variant === "display" || variant === "title"}>
            The quick brown fox
          </Text>
          <span className="text-caption text-text-2">
            <span className="font-mono">{variant}</span> &mdash; {note}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
