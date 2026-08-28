/*
 * Catalog types and the category order.
 *
 * Plain data, no JSX and no "use client", so pages can import it on the server
 * and ship their prose in the initial HTML.
 */

export interface VariantDoc {
  /** Stable key. Must match the key used in the demo registry. */
  id: string;
  title: string;
  /** One or two sentences: when to reach for this variant over its siblings. */
  when: string;
}

export interface ComponentDoc {
  /** Route segment, always prefixed. */
  slug: string;
  name: string;
  category: Category;
  /** One line. Used on the grid card and as the page's meta description. */
  summary: string;
  /** The paragraph under the page title. What it is and what it is for. */
  description: string;
  /** Where this belongs in a real interface. */
  whereToUse: string[];
  /**
   * Let the page use the full content column instead of the prose measure.
   * For components whose width is load-bearing, such as a seven column week.
   */
  wide?: boolean;
  variants: VariantDoc[];
}

export const CATEGORIES = [
  "Actions",
  "Text input",
  "Selection",
  "Pickers",
  "Menus",
  "Navigation",
  "Feedback",
  "Overlays",
  "Display",
  "Patterns",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Every component slug carries this prefix. */
export const SLUG_PREFIX = "minimilist-";

