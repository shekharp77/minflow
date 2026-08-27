"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { CircleCheck, CircleX, Info } from "lucide-react";
import { durations, easeEnter, enter, exit } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Snackbar / toast: transient nonmodal status, the passing counterpart to the
 * standing Alert. It rises into the stack from below, its status icon strikes
 * once on arrival, a hairline countdown drains along its base in the secondary
 * tone, and the stack reflows under layout animation when one leaves.
 */
export type ToastTone = "neutral" | "ok" | "err";

export interface ToastItem {
  id: number;
  title: string;
  tone: ToastTone;
  duration: number;
}

type Listener = (items: ToastItem[]) => void;

let items: ToastItem[] = [];
let seq = 0;
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l(items);
}

export function toast(title: string, opts?: { tone?: ToastTone; duration?: number }) {
  const item: ToastItem = {
    id: ++seq,
    title,
    tone: opts?.tone ?? "neutral",
    duration: opts?.duration ?? 4000,
  };
  items = [...items, item];
  emit();
  window.setTimeout(() => dismissToast(item.id), item.duration);
}

export function dismissToast(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

const toneIcon: Record<ToastTone, React.ReactNode> = {
  neutral: <Info className="size-4 text-fg-2" aria-hidden />,
  ok: <CircleCheck className="size-4 text-ok" aria-hidden />,
  err: <CircleX className="size-4 text-err" aria-hidden />,
};

const toneHalo: Record<ToastTone, string> = {
  neutral: "bg-fg-2",
  ok: "bg-ok",
  err: "bg-err",
};

export function Toaster() {
  const [list, setList] = React.useState<ToastItem[]>(items);

  React.useEffect(() => {
    const l: Listener = (next) => setList(next);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-20 right-6 z-[60] flex w-72 flex-col gap-2"
    >
      <AnimatePresence mode="popLayout">
        {list.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: enter }}
            exit={{ opacity: 0, y: 8, scale: 0.97, transition: exit }}
            className={cn(
              "pointer-events-auto relative overflow-hidden rounded-overlay bg-bg-2 px-3 py-2.5 shadow-overlay ring-1 ring-border"
            )}
          >
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="flex w-full items-center gap-2 text-left text-body text-text outline-none"
            >
              <span className="relative flex size-4 shrink-0 items-center justify-center">
                <motion.span
                  aria-hidden
                  initial={{ scale: 0.4, opacity: 0.4 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  transition={{ duration: durations.ceiling, ease: easeEnter }}
                  className={cn("absolute inset-0 rounded-full", toneHalo[t.tone])}
                />
                {toneIcon[t.tone]}
              </span>
              {t.title}
            </button>
            <motion.span
              aria-hidden
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: t.duration / 1000, ease: "linear" }}
              className="absolute inset-x-0 bottom-0 h-px origin-left bg-fg-2"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
