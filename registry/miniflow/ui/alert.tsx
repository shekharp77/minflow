"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { CircleAlert, CircleCheck, CircleX, Info, X } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import {
  cascade,
  durations,
  easeEnter,
  enter,
  exit,
  fadeRise,
  roll,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Alert: a standing notice about the state of something, as opposed to the
 * toast's passing one. It has no banner and no tinted box; the status icon
 * carries the whole meaning, which is the only thing on the alert allowed to
 * take a status colour.
 *
 * On arrival the icon strikes once (a ring expands out of it and dissolves),
 * then the title and detail rise in behind it. Dismissal collapses the row so
 * the stack closes the gap rather than jumping.
 */
export type AlertTone = "info" | "ok" | "warn" | "err";

const TONE: Record<AlertTone, { icon: React.ReactNode; color: string }> = {
  info: { icon: <Info />, color: "text-fg-2" },
  ok: { icon: <CircleCheck />, color: "text-ok" },
  warn: { icon: <CircleAlert />, color: "text-warn" },
  err: { icon: <CircleX />, color: "text-err" },
};

export interface AlertProps {
  tone?: AlertTone;
  title: React.ReactNode;
  /** Supporting detail. Secondary text, one line where possible. */
  children?: React.ReactNode;
  /** Trailing control, usually the one thing the user can do about it. */
  action?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export function Alert({
  tone = "info",
  title,
  children,
  action,
  onDismiss,
  className,
}: AlertProps) {
  const { icon, color } = TONE[tone];
  const [near, setNear] = React.useState(false);

  return (
    <motion.div
      role={tone === "err" || tone === "warn" ? "alert" : "status"}
      variants={cascade(0.07)}
      initial="hidden"
      animate="visible"
      exit="exit"
      onPointerEnter={() => setNear(true)}
      onPointerLeave={() => setNear(false)}
      className={cn("flex w-full max-w-[58ch] items-start gap-3", className)}
    >
      <motion.span
        variants={fadeRise}
        className={cn("relative mt-px flex size-4 shrink-0 items-center justify-center", color)}
      >
        <motion.span
          aria-hidden
          initial={{ scale: 0.4, opacity: 0.45 }}
          animate={{ scale: 2.4, opacity: 0 }}
          transition={{ duration: durations.ceiling, ease: easeEnter }}
          className="absolute inset-0 rounded-full bg-current"
        />
        <span aria-hidden className="[&_svg]:size-4">
          {icon}
        </span>
      </motion.span>

      <div className="min-w-0 flex-1">
        <motion.p
          variants={fadeRise}
          className="text-body font-medium text-text"
        >
          {title}
        </motion.p>
        {children && (
          <motion.p variants={fadeRise} className="mt-1 text-body text-text-2">
            {children}
          </motion.p>
        )}
        {action && (
          <motion.div variants={fadeRise} className="mt-2 -ml-2.5">
            {action}
          </motion.div>
        )}
      </div>

      {onDismiss && (
        /*
         * Reveal runs through motion, not a hover class: the entrance variant
         * writes an inline opacity that would win over any CSS the class set.
         */
        <motion.span
          initial={false}
          animate={{ opacity: near ? 1 : 0 }}
          transition={roll}
          onFocus={() => setNear(true)}
          onBlur={() => setNear(false)}
          className="shrink-0"
        >
          <IconButton label="Dismiss" size={16} onClick={onDismiss}>
            <X />
          </IconButton>
        </motion.span>
      )}
    </motion.div>
  );
}

/*
 * A stack of alerts that closes its own gaps: dismissing one collapses its
 * row while the rest slide up into the space.
 */
export function AlertStack({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <AnimatePresence initial={false} mode="popLayout">
        {children}
      </AnimatePresence>
    </div>
  );
}

/** Wrap an Alert to make it collapse out of the stack when removed. */
export function AlertRow({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto", transition: enter }}
      exit={{ opacity: 0, height: 0, transition: exit }}
      className="overflow-hidden"
      {...props}
    >
      {children}
    </motion.div>
  );
}
