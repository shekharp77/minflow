"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { durations, easeEnter, pressScale, useHoverCapable, useMotionEnabled } from "@/lib/motion";

/*
 * A wall of images: gallery, moodboard, asset picker.
 *
 * Two layouts, and the choice matters. `grid` crops every tile to one ratio,
 * which is right when the set is being compared. `masonry` keeps each image's
 * own proportions, which is right when the images are the content. Nothing
 * else changes: no captions floating over art, no borders around photographs
 * that already have edges.
 *
 * Tiles fade in as they decode rather than on mount, so a slow image arrives
 * gracefully instead of snapping in after its neighbours.
 */
export interface ImageTile {
  id: string;
  src?: string;
  alt: string;
  /** Aspect ratio for masonry, e.g. "4 / 5". Ignored by the grid layout. */
  ratio?: string;
  caption?: string;
}

export interface ImageListProps {
  items: ImageTile[];
  layout?: "grid" | "masonry";
  columns?: 2 | 3 | 4;
  onSelect?: (item: ImageTile) => void;
  label?: string;
  className?: string;
}

const cols = {
  2: { grid: "grid-cols-2", masonry: "columns-2" },
  3: { grid: "grid-cols-2 sm:grid-cols-3", masonry: "columns-2 sm:columns-3" },
  4: { grid: "grid-cols-2 sm:grid-cols-4", masonry: "columns-2 sm:columns-4" },
} as const;

export function ImageList({
  items,
  layout = "grid",
  columns = 3,
  onSelect,
  label = "Images",
  className,
}: ImageListProps) {
  return (
    <ul
      aria-label={label}
      className={cn(
        "w-full list-none",
        layout === "grid"
          ? cn("grid gap-2", cols[columns].grid)
          : cn(cols[columns].masonry, "gap-2 [column-gap:0.5rem]"),
        className
      )}
    >
      {items.map((item) => (
        <li
          key={item.id}
          className={layout === "masonry" ? "mb-2 break-inside-avoid" : undefined}
        >
          <Tile item={item} layout={layout} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  );
}

function Tile({
  item,
  layout,
  onSelect,
}: {
  item: ImageTile;
  layout: "grid" | "masonry";
  onSelect?: (item: ImageTile) => void;
}) {
  const motionOn = useMotionEnabled();
  const hoverOk = useHoverCapable();
  const [loaded, setLoaded] = React.useState(false);
  const interactive = Boolean(onSelect);
  const Root = interactive ? motion.button : motion.div;

  return (
    <Root
      {...(interactive
        ? { type: "button" as const, onClick: () => onSelect?.(item) }
        : {})}
      whileHover={motionOn && hoverOk ? { scale: 1.015 } : undefined}
      whileTap={motionOn && interactive ? { scale: pressScale } : undefined}
      transition={{ duration: durations.micro, ease: easeEnter }}
      style={{ aspectRatio: layout === "grid" ? "1 / 1" : (item.ratio ?? "4 / 5") }}
      className={cn(
        "group relative block w-full overflow-hidden rounded-control bg-bg-2 outline-none",
        interactive &&
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      )}
    >
      {item.src ? (
        <motion.img
          src={item.src}
          alt={item.alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          initial={false}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: motionOn ? durations.view : 0, ease: easeEnter }}
          className="size-full object-cover"
        />
      ) : (
        /* No source: the tile is its own placeholder rather than a broken
           image icon, and the alt text still names it for assistive tech. */
        <span role="img" aria-label={item.alt} className="sr-only">
          {item.alt}
        </span>
      )}

      {item.caption ? (
        <span
          className={cn(
            "absolute inset-x-0 bottom-0 truncate px-2 py-1.5 text-left text-caption text-text",
            "bg-bg/70 backdrop-blur-sm opacity-0 transition-opacity duration-150",
            "group-hover:opacity-100 group-focus-visible:opacity-100"
          )}
        >
          {item.caption}
        </span>
      ) : null}
    </Root>
  );
}
