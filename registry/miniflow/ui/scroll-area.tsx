"use client";

import * as React from "react";
import Lenis from "lenis";
import { useMotionEnabled } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Scroll area with a quiet overlay scrollbar and Apple-feel momentum: an
 * element-scoped lenis eases wheel input inside the area, the hairline
 * thumb fades in while scrolling, then sleeps. Momentum respects
 * prefers-reduced-motion and the app-level motion switch.
 */
export interface ScrollAreaProps {
  /** Momentum-smooth the wheel inside this area. */
  smooth?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function ScrollArea({ smooth = true, className, children }: ScrollAreaProps) {
  const innerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = React.useState({ top: 0, height: 0, visible: false });
  const hideTimer = React.useRef<number>(0);
  const motionOk = useMotionEnabled();

  const update = React.useCallback(() => {
    const el = innerRef.current;
    if (!el) return;
    const ratio = el.clientHeight / el.scrollHeight;
    if (ratio >= 1) return;
    setThumb({
      top: (el.scrollTop / el.scrollHeight) * el.clientHeight,
      height: Math.max(24, ratio * el.clientHeight),
      visible: true,
    });
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(
      () => setThumb((t) => ({ ...t, visible: false })),
      700
    );
  }, []);

  React.useEffect(() => {
    if (!smooth || !motionOk) return;
    const wrapper = innerRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;
    const lenis = new Lenis({ wrapper, content, duration: 0.9 });
    let frame = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [smooth, motionOk]);

  return (
    <div className={cn("relative", className)}>
      <div
        ref={innerRef}
        onScroll={update}
        className="h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div ref={contentRef}>{children}</div>
      </div>
      <span
        aria-hidden
        style={{ top: thumb.top, height: thumb.height, opacity: thumb.visible ? 1 : 0 }}
        className="absolute right-0.5 w-1 rounded-full bg-border-strong transition-opacity duration-300"
      />
    </div>
  );
}
