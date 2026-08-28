"use client";

import * as React from "react";
import { motion, useAnimationControls } from "motion/react";
import { morph } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Carousel: panes drag with elastic feel and snap to the nearest slide;
 * the active pager dot stretches into a pill and slides between positions.
 */
export interface CarouselProps {
  items: React.ReactNode[];
  className?: string;
}

export function Carousel({ items, className }: CarouselProps) {
  const [index, setIndex] = React.useState(0);
  const [width, setWidth] = React.useState(0);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const id = React.useId();

  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => setWidth(el.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const goTo = React.useCallback(
    (i: number) => {
      const next = Math.min(items.length - 1, Math.max(0, i));
      setIndex(next);
      controls.start({
        x: -next * width,
        transition: morph,
      });
    },
    [controls, items.length, width]
  );

  React.useEffect(() => {
    controls.set({ x: -index * width });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Gallery"
      className={cn("w-full max-w-96 select-none", className)}
    >
      <div ref={viewportRef} className="overflow-hidden rounded-overlay">
        <motion.div
          drag="x"
          dragConstraints={{ left: -(items.length - 1) * width, right: 0 }}
          dragElastic={0.08}
          animate={controls}
          onDragEnd={(_, info) => {
            const delta =
              info.offset.x < -width / 4 || info.velocity.x < -400
                ? 1
                : info.offset.x > width / 4 || info.velocity.x > 400
                  ? -1
                  : 0;
            goTo(index + delta);
          }}
          className="flex cursor-grab active:cursor-grabbing"
        >
          {items.map((item, i) => (
            <div
              key={i}
              aria-hidden={i !== index}
              className="w-full shrink-0"
              style={{ width: width || "100%" }}
            >
              {item}
            </div>
          ))}
        </motion.div>
      </div>
      <div className="mt-3 flex items-center justify-center">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            aria-current={i === index}
            onClick={() => goTo(i)}
            className="group/dot flex h-6 items-center px-1 outline-none"
          >
            {i === index ? (
              <motion.span
                layoutId={`${id}-dot`}
                transition={morph}
                className="h-1.5 w-4 rounded-full bg-fg"
              />
            ) : (
              <span className="size-1.5 rounded-full bg-border-strong transition-colors duration-150 group-hover/dot:bg-fg-2" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
