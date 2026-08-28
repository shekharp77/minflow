"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { enter, exit } from "@/lib/motion";

/* Shared plumbing for transient surfaces: portal, scrim, dismiss, body lock. */

export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}

/** Escape or pointer-down outside any of the given refs closes the surface. */
export function useDismiss(
  open: boolean,
  onClose: () => void,
  refs: Array<React.RefObject<HTMLElement | null>>
) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const onDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (refs.some((ref) => ref.current?.contains(target))) return;
      onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown, true);
    };
  }, [open, onClose, refs]);
}

export function useBodyLock(open: boolean) {
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);
}

/*
 * Token-derived backdrop: a quiet ink tint with a breath of blur. It settles
 * in on the house entry curve and clears out faster than it arrived, so the
 * surface it backs is always the thing the eye is following.
 */
export function Scrim(props: { onClick?: () => void }) {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: enter }}
      exit={{ opacity: 0, transition: exit }}
      onClick={props.onClick}
      className="fixed inset-0 z-scrim bg-fg/15 backdrop-blur-[2px]"
    />
  );
}

/* ------------------------------------------------------------------ *
 * Anchored layers
 * ------------------------------------------------------------------ */

/*
 * A menu, a select panel or a tooltip is anchored to a control but does not
 * belong to it. Positioning one with `absolute` inside the trigger's own box
 * makes every ancestor a potential guillotine: any `overflow: hidden` on the
 * way up - a card, a scroller, a documentation stage - crops the panel, and
 * the panel cannot know it happened. That is one bug, not many, and this is
 * where it is fixed: the layer is portalled to the body and placed in viewport
 * coordinates, so the only box that can ever clip it is the window.
 *
 * Placement is measured rather than assumed. The layer flips to the other side
 * of the anchor when its preferred side cannot hold it, clamps back inside the
 * viewport when an edge-adjacent trigger would push it off, and reports the
 * space it actually got as `maxHeight` so a long list scrolls instead of
 * spilling.
 */

export type AnchorSide = "top" | "bottom" | "left" | "right";
export type AnchorAlign = "start" | "end" | "center";

export interface AnchorOptions {
  side?: AnchorSide;
  align?: AnchorAlign;
  /** Gap between the anchor edge and the layer. */
  offset?: number;
  /** Take the anchor's width, which is what a list field's panel wants. */
  matchWidth?: boolean;
}

/** Breathing room kept between a layer and the window edge. */
const VIEWPORT_MARGIN = 8;
/** Never squeeze a panel below this; flip rather than present a sliver. */
const MIN_PANEL_HEIGHT = 96;

export function useAnchoredPosition(
  open: boolean,
  anchorRef: React.RefObject<HTMLElement | null>,
  layerRef: React.RefObject<HTMLElement | null>,
  { side = "bottom", align = "start", offset = 8, matchWidth = false }: AnchorOptions = {}
) {
  const [style, setStyle] = React.useState<React.CSSProperties>({
    position: "fixed",
    top: -9999,
    left: -9999,
  });
  const [origin, setOrigin] = React.useState("top left");

  const place = React.useCallback(() => {
    const anchor = anchorRef.current?.getBoundingClientRect();
    if (!anchor) return;
    const layer = layerRef.current?.getBoundingClientRect();
    /* First pass runs before the layer has a box; the anchor's width is the
       best guess available and the rAF pass below corrects it. */
    const width = layer?.width || anchor.width;
    const height = layer?.height ?? 0;
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const horizontal = side === "left" || side === "right";

    let top: number;
    let left: number;
    let maxHeight: number;
    let placed: AnchorSide = side;

    if (horizontal) {
      /* Beside the anchor: a submenu flyout. It flips across the anchor when
         its own side runs out, which is what keeps a deep menu chain on
         screen instead of marching off the right edge. */
      const roomRight = vw - anchor.right - offset - VIEWPORT_MARGIN;
      const roomLeft = anchor.left - offset - VIEWPORT_MARGIN;
      if (side === "right" && width > roomRight && roomLeft > roomRight) placed = "left";
      if (side === "left" && width > roomLeft && roomRight > roomLeft) placed = "right";
      left = placed === "right" ? anchor.right + offset : anchor.left - offset - width;
      left = Math.min(Math.max(VIEWPORT_MARGIN, left), Math.max(VIEWPORT_MARGIN, vw - width - VIEWPORT_MARGIN));
      maxHeight = Math.max(MIN_PANEL_HEIGHT, vh - anchor.top - VIEWPORT_MARGIN);
      /* Aligned to the anchor's top edge, then pulled up if the tail would
         fall off the bottom. */
      top = Math.min(anchor.top, Math.max(VIEWPORT_MARGIN, vh - height - VIEWPORT_MARGIN));
    } else {
      const roomBelow = vh - anchor.bottom - offset - VIEWPORT_MARGIN;
      const roomAbove = anchor.top - offset - VIEWPORT_MARGIN;

      /* Flip only when the preferred side genuinely cannot hold the layer and
         the other side is roomier. Flipping on a near-miss makes a menu jump
         between openings, which is worse than a slightly short panel. */
      if (side === "bottom" && height > roomBelow && roomAbove > roomBelow) placed = "top";
      if (side === "top" && height > roomAbove && roomBelow > roomAbove) placed = "bottom";

      maxHeight = Math.max(MIN_PANEL_HEIGHT, placed === "bottom" ? roomBelow : roomAbove);
      top =
        placed === "bottom"
          ? anchor.bottom + offset
          : Math.max(VIEWPORT_MARGIN, anchor.top - offset - Math.min(height, maxHeight));

      left =
        align === "end"
          ? anchor.right - width
          : align === "center"
            ? anchor.left + anchor.width / 2 - width / 2
            : anchor.left;
      /* Clamp last, so an edge-adjacent trigger slides its panel back on
         screen instead of hanging off it. This is what a centred tooltip on a
         control near the right edge has always needed. */
      left = Math.min(Math.max(VIEWPORT_MARGIN, left), Math.max(VIEWPORT_MARGIN, vw - width - VIEWPORT_MARGIN));
    }

    setOrigin(
      horizontal
        ? `top ${placed === "right" ? "left" : "right"}`
        : `${placed === "bottom" ? "top" : "bottom"} ${
            align === "end" ? "right" : align === "center" ? "center" : "left"
          }`
    );
    setStyle({
      position: "fixed",
      top: Math.round(top),
      left: Math.round(left),
      maxHeight: Math.round(maxHeight),
      ...(matchWidth ? { width: Math.round(anchor.width) } : {}),
    });
  }, [anchorRef, layerRef, side, align, offset, matchWidth]);

  React.useLayoutEffect(() => {
    if (!open) return;
    place();
    /* Second pass once the layer has been laid out and its real height is
       knowable, which is what flipping and clamping actually depend on. */
    const frame = requestAnimationFrame(place);
    /* Capture phase: the anchor may live inside a scroller of its own, and a
       layer that does not follow it detaches from the control it belongs to. */
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, place]);

  return { style, origin };
}
