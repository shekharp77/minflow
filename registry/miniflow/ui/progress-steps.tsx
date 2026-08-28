"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  draw,
  durations,
  easeEnter,
  easeSoft,
  useMotionEnabled,
} from "@/lib/motion";

/*
 * Where you are in a task with a known number of stages.
 *
 * State is carried by the palette's two weights rather than by colour coding:
 * finished and current steps sit on the primary slots (`fg`, `text`), steps
 * still ahead sit on the secondary ones (`fg-2`, `text-2`). The connector
 * fills as progress is made, so the row reads as one bar that is partly done
 * rather than as separate lamps.
 *
 * Not to be confused with Input stepper, which increments a number.
 */
export interface ProgressStep {
  id: string;
  label: string;
  /** One line under the label. Vertical layout only. */
  detail?: string;
}

export interface ProgressStepsProps {
  steps: ProgressStep[];
  /** Index of the step in progress. Equal to steps.length means all done. */
  active: number;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function ProgressSteps({
  steps,
  active,
  orientation = "horizontal",
  className,
}: ProgressStepsProps) {
  const motionOn = useMotionEnabled();
  const vertical = orientation === "vertical";

  return (
    <ol
      className={cn(
        "flex list-none",
        vertical ? "flex-col" : "w-full items-start",
        className
      )}
    >
      {steps.map((step, i) => {
        const done = i < active;
        const current = i === active;
        const last = i === steps.length - 1;

        return (
          <li
            key={step.id}
            aria-current={current ? "step" : undefined}
            className={cn(
              "flex min-w-0",
              vertical ? "gap-3" : "flex-1 last:flex-none"
            )}
          >
            {vertical ? (
              <div className="flex shrink-0 flex-col items-center">
                <Marker done={done} current={current} index={i} />
                {!last && <Connector filled={done} vertical />}
              </div>
            ) : null}

            <div
              className={cn(
                vertical ? "min-w-0 pb-6" : "flex min-w-0 flex-1 flex-col"
              )}
            >
              {!vertical ? (
                <div className="flex w-full items-center gap-2">
                  <Marker done={done} current={current} index={i} />
                  {!last && <Connector filled={done} />}
                </div>
              ) : null}

              <p
                className={cn(
                  "truncate text-body transition-colors duration-300",
                  vertical ? "" : "mt-2 pr-2",
                  done || current ? "font-medium text-text" : "text-text-2"
                )}
              >
                {step.label}
              </p>
              {vertical && step.detail ? (
                <p className="mt-0.5 text-caption text-text-2">{step.detail}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Marker({
  done,
  current,
  index,
}: {
  done: boolean;
  current: boolean;
  index: number;
}) {
  const motionOn = useMotionEnabled();

  return (
    <motion.span
      aria-hidden
      animate={{ scale: current ? 1 : 0.92 }}
      transition={{ duration: motionOn ? durations.micro : 0, ease: easeEnter }}
      className={cn(
        "relative inline-flex size-6 shrink-0 items-center justify-center rounded-full text-caption font-medium transition-colors duration-300",
        done && "bg-fg text-bg",
        current && "bg-bg-2 text-text",
        !done && !current && "bg-bg-2 text-text-2"
      )}
    >
      {/* One quiet pulse marks the live step without ever finishing, which is
          exactly what "in progress" means. */}
      {current && motionOn && (
        <motion.span
          className="absolute inset-0 rounded-full bg-fg-2/25"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.svg
            key="tick"
            viewBox="0 0 24 24"
            className="size-3.5"
            initial={motionOn ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={motionOn ? { opacity: 0 } : undefined}
          >
            <motion.path
              d="M5 13l4 4L19 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={motionOn ? { pathLength: 0 } : false}
              animate={{ pathLength: 1 }}
              transition={draw}
            />
          </motion.svg>
        ) : (
          <motion.span
            key="num"
            initial={motionOn ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={motionOn ? { opacity: 0 } : undefined}
            transition={{ duration: durations.micro }}
          >
            {index + 1}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.span>
  );
}

/* The rail between two markers. It fills rather than switching on, so the
   progress reads as travel. */
function Connector({ filled, vertical }: { filled: boolean; vertical?: boolean }) {
  const motionOn = useMotionEnabled();
  return (
    <span
      aria-hidden
      className={cn(
        "relative overflow-hidden rounded-full bg-fg-2/25",
        vertical ? "my-1 w-px flex-1" : "h-px min-w-4 flex-1"
      )}
    >
      <motion.span
        initial={motionOn ? { scaleY: vertical ? 0 : 1, scaleX: vertical ? 1 : 0 } : false}
        animate={{
          scaleY: vertical ? (filled ? 1 : 0) : 1,
          scaleX: vertical ? 1 : filled ? 1 : 0,
        }}
        transition={{ duration: durations.view, ease: easeSoft }}
        className={cn(
          "absolute inset-0 bg-fg",
          vertical ? "origin-top" : "origin-left"
        )}
      />
    </span>
  );
}
