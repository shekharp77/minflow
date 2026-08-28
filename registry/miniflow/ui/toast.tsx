"use client";

import * as React from "react";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  type AnimationPlaybackControls,
  type PanInfo,
} from "motion/react";
import { CircleCheck, CircleX, Info } from "lucide-react";
import {
  enter,
  exit,
  halo,
  shouldDismiss,
  springDrag,
  useMotionEnabled,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Snackbar / toast: transient nonmodal status, the passing counterpart to the
 * standing Alert. It rises into the stack from below, its status icon strikes
 * once on arrival, a hairline countdown drains along its base, and the stack
 * reflows under layout animation when one leaves.
 *
 * The countdown is not a decoration drawn next to a `setTimeout` -- it *is*
 * the timer. Pausing the bar pauses the dismissal, which is the only way the
 * two can never disagree: a progress bar that keeps draining while the timer
 * is held, or a toast that vanishes under a cursor that is still reading it,
 * are both the same bug in different clothes.
 *
 * A toast can also be thrown off to the right. That is the fastest way to
 * clear one, and it means the reader never has to hit a small close target on
 * something that is about to leave anyway.
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

function Toast({ item }: { item: ToastItem }) {
  const motionOk = useMotionEnabled();
  const progress = useMotionValue(1);
  const run = React.useRef<AnimationPlaybackControls | null>(null);

  /*
   * The bar drains linearly because it represents elapsed time and nothing
   * else. Any easing here would be a lie about how much of the wait is left.
   */
  React.useEffect(() => {
    const controls = animate(progress, 0, {
      duration: item.duration / 1000,
      ease: "linear",
      onComplete: () => dismissToast(item.id),
    });
    run.current = controls;
    return () => controls.stop();
  }, [item.id, item.duration, progress]);

  const hold = () => run.current?.pause();
  const release = () => run.current?.play();

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (shouldDismiss(info.offset.x, info.velocity.x, 180)) dismissToast(item.id);
    else release();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: enter }}
      exit={{ opacity: 0, y: 8, scale: 0.97, transition: exit }}
      /* Pointer or keyboard, the rule is the same: while it is being read, it stays. */
      onPointerEnter={hold}
      onPointerLeave={release}
      onFocusCapture={hold}
      onBlurCapture={release}
      drag={motionOk ? "x" : false}
      dragDirectionLock
      dragConstraints={{ left: 0, right: 0 }}
      /* Free to the right, near-solid to the left: the throw has one direction. */
      dragElastic={{ right: 1, left: 0.04 }}
      dragMomentum={false}
      /* Critically damped (2*sqrt(520) ~= 46): it returns to rest
         without overshooting past it. */
      dragTransition={{ bounceStiffness: 520, bounceDamping: 46 }}
      onDragStart={hold}
      onDragEnd={onDragEnd}
      whileDrag={{ cursor: "grabbing" }}
      transition={springDrag}
      style={{ touchAction: "pan-y" }}
      className={cn(
        "pointer-events-auto relative overflow-hidden rounded-overlay bg-bg-2 px-3 py-2.5 shadow-overlay ring-1 ring-border"
      )}
    >
      <button
        type="button"
        onClick={() => dismissToast(item.id)}
        className="flex w-full items-center gap-2 text-left text-body text-text outline-none"
      >
        <span className="relative flex size-4 shrink-0 items-center justify-center">
          <motion.span
            aria-hidden
            variants={halo}
            initial="hidden"
            animate="visible"
            className={cn("absolute inset-0 rounded-full", toneHalo[item.tone])}
          />
          {toneIcon[item.tone]}
        </span>
        {item.title}
      </button>
      <motion.span
        aria-hidden
        style={{ scaleX: progress }}
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-fg-2"
      />
    </motion.div>
  );
}

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
      className="pointer-events-none fixed bottom-20 right-6 z-toast flex w-72 flex-col gap-2"
    >
      {/*
        `popLayout` takes a leaving toast out of the flow before the survivors
        reflow, so the stack closes the gap in one continuous move instead of
        jumping once the exit finishes.
      */}
      <AnimatePresence mode="popLayout">
        {list.map((t) => (
          <Toast key={t.id} item={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
