"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { LoaderCircle } from "lucide-react";
import { Portal, useBodyLock } from "@/components/ui/overlay";
import { draw, durations, easeSoft, enter, exit, roll } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Fullscreen loader as a timeline of work, read through the two theme
 * registers: work that is done or under way stands in the primary tone, work
 * still pending waits in the secondary one. So the eye lands on progress
 * first and the remaining steps recede without being hidden.
 *
 * The current step carries a spinner, finished steps draw their tick, older
 * finished steps sink out of focus with progressive blur, and the connecting
 * spine fills from secondary to primary as work completes.
 */
/*
 * The recede: a finished step sinks out of focus rather than vanishing, so the
 * list keeps its history without competing with the step in hand. It is CSS
 * rather than Motion because it rides `filter`, which is a paint property with
 * no compositor path -- there is nothing for a JS animation to buy here.
 *
 * Derived from the token layer rather than hand-typed, so it cannot drift away
 * from the rest of the system the way two loose "450ms ease" strings did.
 */
const RECEDE_MS = Math.round(durations.focal * 1000);
const CUBIC = `cubic-bezier(${easeSoft.join(",")})`;
const RECEDE = `filter ${RECEDE_MS}ms ${CUBIC}, opacity ${RECEDE_MS}ms ${CUBIC}`;

export interface FullscreenLoaderProps {
  open: boolean;
  steps: string[];
  /** Index of the step in progress; steps.length means all done. */
  current: number;
  title?: string;
}

export function FullscreenLoader({
  open,
  steps,
  current,
  title = "Setting up",
}: FullscreenLoaderProps) {
  useBodyLock(open);

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: exit }}
            transition={{ duration: durations.bloom }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-bg"
          >
            <div className="w-72">
              <h2 className="font-display text-title font-bold text-text">
                {title}
              </h2>
              <div className="mt-8 flex flex-col">
                {steps.map((step, i) => {
                  const isCurrent = i === current;
                  const isDone = i < current;
                  const age = current - i; /* 1 = just done */
                  const blur = isDone ? Math.min(2.5, Math.max(0, age - 1) * 0.9) : 0;
                  const doneOpacity = isDone
                    ? Math.max(0.45, 1 - Math.max(0, age - 1) * 0.18)
                    : 1;

                  return (
                    <div key={step} className="flex gap-3">
                      <span className="flex w-4 shrink-0 flex-col items-center gap-1">
                        <span
                          className="mt-0.5 flex size-4 items-center justify-center"
                          style={{
                            filter: `blur(${blur}px)`,
                            opacity: doneOpacity,
                            transition: RECEDE,
                          }}
                        >
                          {isDone ? (
                            <svg
                              viewBox="0 0 16 16"
                              fill="none"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="size-4 stroke-fg"
                            >
                              <motion.path
                                d="M3.5 8.5 6.5 11.5 12.5 4.5"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={draw}
                              />
                            </svg>
                          ) : isCurrent ? (
                            <motion.span
                              initial={{ scale: 0.85, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={roll}
                            >
                              <LoaderCircle className="size-4 animate-spin text-fg" />
                            </motion.span>
                          ) : (
                            <span className="size-2 rounded-full border border-fg-2" />
                          )}
                        </span>
                        {i < steps.length - 1 && (
                          <span className="relative h-5 w-px overflow-hidden bg-fg-2/30">
                            <motion.span
                              initial={false}
                              animate={{ scaleY: isDone ? 1 : 0 }}
                              transition={enter}
                              className="absolute inset-0 origin-top bg-fg"
                            />
                          </span>
                        )}
                      </span>
                      <span
                        className={cn(
                          "text-body transition-colors duration-500",
                          /* done and in-progress read primary, pending secondary */
                          isDone && "text-text",
                          isCurrent && "font-medium text-text",
                          !isCurrent && !isDone && "text-text-2"
                        )}
                        style={
                          isDone
                            ? {
                                filter: `blur(${blur}px)`,
                                opacity: doneOpacity,
                                transition: RECEDE,
                              }
                            : undefined
                        }
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
