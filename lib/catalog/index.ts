import { actionsComponents } from "@/lib/catalog/actions";
import { textInputComponents } from "@/lib/catalog/text-input";
import { selectionComponents } from "@/lib/catalog/selection";
import { pickersMenusNavComponents } from "@/lib/catalog/pickers-menus-nav";
import { feedbackOverlaysDisplayComponents } from "@/lib/catalog/feedback-overlays-display";
import { CATEGORIES, type ComponentDoc } from "@/lib/catalog/types";

export * from "@/lib/catalog/types";

/*
 * The component catalog: one entry per documented component, split into one
 * file per category so adding a component touches a small file rather than a
 * thousand-line one.
 *
 * Adding a component? CLAUDE.md has the checklist of every file to change.
 */
const ALL: ComponentDoc[] = [
  ...actionsComponents,
  ...textInputComponents,
  ...selectionComponents,
  ...pickersMenusNavComponents,
  ...feedbackOverlaysDisplayComponents,
];

/* Sorted by the canonical category order so nav and grid always agree. */
export const COMPONENTS: ComponentDoc[] = CATEGORIES.flatMap((category) =>
  ALL.filter((c) => c.category === category)
);
