import type { MetadataRoute } from "next";
import { COMPONENTS } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

/* Every route is statically known, so the sitemap is generated from the same
 * catalog the pages are, and cannot drift out of sync with them. */
export default function sitemap(): MetadataRoute.Sitemap {
  const guides = ["", "/introduction", "/installation"];

  return [
    ...guides.map((path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...COMPONENTS.map((c) => ({
      url: `${SITE_URL}/${c.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
