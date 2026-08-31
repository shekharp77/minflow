"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { durations, easeEnter, useMotionEnabled } from "@/lib/motion";

/*
 * A person, at a glance.
 *
 * No ring, no shadow, no gradient: a filled disc and two letters. The tint is
 * derived from the name rather than chosen, so the same person is the same
 * colour everywhere in an app and a list of faces becomes scannable without
 * anybody reading it. It is drawn from the three identity tones the palette
 * already owns, so a custom palette restyles avatars for free.
 */

export type AvatarSize = 20 | 24 | 32 | 40;

export interface AvatarProps extends React.ComponentProps<"span"> {
  name: string;
  src?: string;
  size?: AvatarSize;
  /** Adds a presence dot. */
  status?: "online" | "away" | "offline";
}

const box: Record<AvatarSize, string> = {
  20: "size-5 text-[0.5625rem]",
  24: "size-6 text-[0.625rem]",
  32: "size-8 text-caption",
  40: "size-10 text-body",
};

const TONES = ["bg-id-1/15 text-id-1", "bg-id-2/15 text-id-2", "bg-id-3/15 text-id-3"];

const statusTone = {
  online: "bg-ok",
  away: "bg-warn",
  offline: "bg-fg-2",
} as const;

/** Stable, order-independent: the same name always lands on the same tone. */
function toneFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997;
  return TONES[h % TONES.length];
}

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  name,
  src,
  size = 32,
  status,
  className,
  ...props
}: AvatarProps) {
  const motionOn = useMotionEnabled();
  const [loaded, setLoaded] = React.useState(false);
  /*
   * `onLoad` alone is not enough. A cached or data-URI image can finish
   * decoding before React attaches the handler, so the event never arrives and
   * the photo stays at opacity 0 forever. Seeding from `complete` on mount is
   * the only reading that is true in both cases.
   */
  const seed = React.useCallback((el: HTMLImageElement | null) => {
    if (el?.complete) setLoaded(true);
  }, []);

  return (
    <span
      data-slot="avatar"
      title={name}
      className={cn("relative inline-flex shrink-0", className)}
      {...props}
    >
      <span
        aria-label={name}
        role="img"
        className={cn(
          "inline-flex select-none items-center justify-center overflow-hidden rounded-full font-medium",
          box[size],
          /* Initials stay underneath the image, so a slow or broken photo
             degrades to a readable avatar instead of an empty hole. */
          toneFor(name)
        )}
      >
        {initialsOf(name)}
        {src && (
          <motion.img
            ref={seed}
            src={src}
            alt=""
            onLoad={() => setLoaded(true)}
            initial={false}
            animate={{ opacity: loaded ? 1 : 0 }}
            transition={{ duration: motionOn ? durations.micro : 0, ease: easeEnter }}
            className="absolute inset-0 size-full object-cover"
          />
        )}
      </span>
      {status && (
        <span
          aria-label={status}
          role="status"
          className={cn(
            "absolute -bottom-px -right-px rounded-full ring-2 ring-bg",
            size <= 24 ? "size-1.5" : "size-2",
            statusTone[status]
          )}
        />
      )}
    </span>
  );
}

export interface AvatarGroupProps {
  people: { name: string; src?: string }[];
  size?: AvatarSize;
  /** Faces shown before the rest collapse into a count. */
  max?: number;
  className?: string;
}

/*
 * Overlapped stack that opens on hover. The overlap saves space; the spread on
 * hover is what makes the saving reversible, so nobody is stuck guessing who
 * is behind whom.
 */
export function AvatarGroup({ people, size = 32, max = 4, className }: AvatarGroupProps) {
  const motionOn = useMotionEnabled();
  const [open, setOpen] = React.useState(false);
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;

  return (
    <div
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      className={cn("flex items-center", className)}
    >
      {shown.map((p, i) => (
        <motion.span
          key={p.name}
          /*
           * The overlap is information (how many people, in how little space),
           * so it holds whether or not motion is on. Only the travel between
           * the two states is a motion concern.
           */
          animate={{ marginLeft: i === 0 ? 0 : open ? 4 : -8 }}
          transition={{ duration: motionOn ? durations.micro : 0, ease: easeEnter }}
          style={{ zIndex: shown.length - i }}
          className="rounded-full ring-2 ring-bg"
        >
          <Avatar name={p.name} src={p.src} size={size} />
        </motion.span>
      ))}
      {rest > 0 && (
        <motion.span
          animate={{ marginLeft: open ? 4 : -8 }}
          transition={{ duration: motionOn ? durations.micro : 0, ease: easeEnter }}
          className={cn(
            "inline-flex select-none items-center justify-center rounded-full bg-bg-2 font-medium text-text-2 ring-2 ring-bg",
            box[size]
          )}
        >
          +{rest}
        </motion.span>
      )}
    </div>
  );
}
