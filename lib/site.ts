/*
 * The canonical origin, used for metadataBase, the sitemap, robots, and every
 * canonical tag. minflow.design is the real home, so it is the built-in
 * default rather than deploy-time configuration that can be forgotten and
 * silently ship a localhost canonical. NEXT_PUBLIC_SITE_URL still overrides it
 * for previews and branch deploys.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://minflow.design";

/*
 * The public repository. Declared once here because it is quoted in three
 * places that must never disagree: the header's source link, the contribution
 * note in the introduction, and the README.
 */
export const REPO_URL = "https://github.com/shekharp77/minflow";
