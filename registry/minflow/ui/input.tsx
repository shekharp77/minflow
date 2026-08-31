"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cva, type VariantProps } from "class-variance-authority";
import { IconButton, type IconButtonProps } from "@/components/ui/icon-button";
import { FieldBoundary } from "@/registry/minflow/ui/field";
import { fadeScale } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Textbox. Inline is the house input and it never draws a boundary, in any
 * state: no fill, no box, no rule, not even on focus. What you see is the
 * placeholder, an optional leading glyph, and a trailing action that stays
 * hidden until there is something to commit. The field's position in the
 * layout is what says where to type, which is what lets an inline input
 * create an object exactly where the object will live (see InlineCreate).
 *
 * inline  - body text, no chrome. The default.
 * muted   - secondary-toned. Optional slots waiting to be filled in later.
 * heading - display face. The object-title field.
 * boxed   - the one bounded variant: hairline all around, still no fill.
 */
const inputVariants = cva(
  "peer w-full min-w-0 bg-transparent font-sans outline-none transition-colors duration-150 placeholder:text-text-2/70 disabled:pointer-events-none disabled:opacity-50 aria-invalid:text-err",
  {
    variants: {
      variant: {
        inline: "text-text",
        muted: "text-text-2 placeholder:text-text-2/70",
        heading: "font-display font-bold tracking-[-0.01em] text-text",
        boxed: "text-text",
      },
      size: {
        sm: "h-7 text-caption",
        md: "h-8 text-body",
        lg: "h-9 text-emphasis",
      },
    },
    compoundVariants: [
      { variant: "heading", size: "sm", class: "h-8 text-section" },
      { variant: "heading", size: "md", class: "h-9 text-title" },
      { variant: "heading", size: "lg", class: "h-11 text-display" },
    ],
    defaultVariants: {
      variant: "inline",
      size: "md",
    },
  }
);

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  /** Leading glyph. Always visible. */
  icon?: React.ReactNode;
  /** Trailing affordance, revealed once the field has content. */
  action?: React.ReactNode;
}

export function Input({
  className,
  variant = "inline",
  size,
  icon,
  action,
  onFocus,
  onBlur,
  onChange,
  ...props
}: InputProps) {
  const [focused, setFocused] = React.useState(false);
  const [typed, setTyped] = React.useState(
    () => String(props.defaultValue ?? "").length > 0
  );

  const hasText =
    props.value !== undefined ? String(props.value).length > 0 : typed;
  const invalid =
    props["aria-invalid"] === true || props["aria-invalid"] === "true";
  const boxed = variant === "boxed";

  return (
    <span
      data-slot="input-field"
      className={cn(
        "relative inline-flex w-full items-center gap-2",
        boxed && "rounded-control border border-border px-2.5"
      )}
    >
      {icon && (
        <span aria-hidden className="shrink-0 text-fg-2 [&_svg]:size-4">
          {icon}
        </span>
      )}
      <input
        data-slot="input"
        className={cn(inputVariants({ variant, size }), className)}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        onChange={(event) => {
          setTyped(event.target.value.length > 0);
          onChange?.(event);
        }}
        {...props}
      />
      <AnimatePresence initial={false}>
        {action && hasText && (
          <motion.span
            variants={fadeScale}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="shrink-0"
          >
            {action}
          </motion.span>
        )}
      </AnimatePresence>
      {boxed && <FieldBoundary active={focused} invalid={invalid} />}
    </span>
  );
}

/*
 * The trailing control an inline field reveals once it has content, usually
 * commit. 28px visual, 40px effective hit target via the ::after expansion.
 */
export function InputAction({ className, ...props }: IconButtonProps) {
  return (
    <IconButton
      className={cn("relative size-7 after:absolute after:-inset-1.5", className)}
      {...props}
    />
  );
}
