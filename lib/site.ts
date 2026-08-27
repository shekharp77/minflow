/*
 * The canonical origin, used for metadataBase, the sitemap, and robots.
 * Set NEXT_PUBLIC_SITE_URL in the deploy environment; the localhost fallback
 * only ever applies in development.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
