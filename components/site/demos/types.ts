import type * as React from "react";

/**
 * A component's live demos, keyed by the variant `id` in lib/catalog.
 * The page looks each variant up by id, so a missing or misspelled key shows
 * up as an empty demo slot rather than a silently shifted list.
 */
export type DemoSet = Record<string, Record<string, React.ReactNode>>;
