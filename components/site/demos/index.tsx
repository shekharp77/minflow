"use client";

import * as React from "react";
import { actionDemos } from "@/components/site/demos/actions";
import { feedbackOverlaysDisplayDemos } from "@/components/site/demos/feedback-overlays-display";
import { pickersMenusNavDemos } from "@/components/site/demos/pickers-menus-nav";
import { selectionDemos } from "@/components/site/demos/selection";
import { textDemos } from "@/components/site/demos/text";
import { dataDisplayDemos } from "@/components/site/demos/data-display";
import { controlsNavDemos } from "@/components/site/demos/controls-nav";
import type { DemoSet } from "@/components/site/demos/types";

/*
 * The live-demo registry: slug -> variant id -> rendered demo.
 *
 * This is the only client-side half of a component page. The prose comes from
 * lib/catalog on the server, so a page still ships complete, readable HTML
 * even before this ever hydrates.
 */
const DEMOS: DemoSet = {
  ...actionDemos,
  ...textDemos,
  ...selectionDemos,
  ...pickersMenusNavDemos,
  ...feedbackOverlaysDisplayDemos,
  ...dataDisplayDemos,
  ...controlsNavDemos,
};

export function Demo({ slug, variant }: { slug: string; variant: string }) {
  const node = DEMOS[slug]?.[variant];

  if (!node) {
    /* Loud rather than silent: an unregistered demo is a wiring mistake. */
    return (
      <p className="text-caption text-text-2">
        No demo registered for {slug} / {variant}.
      </p>
    );
  }

  return <>{node}</>;
}

export function hasDemos(slug: string) {
  return Boolean(DEMOS[slug]);
}
