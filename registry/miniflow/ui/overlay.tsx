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
      className="fixed inset-0 z-50 bg-fg/15 backdrop-blur-[2px]"
    />
  );
}
