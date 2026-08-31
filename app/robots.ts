import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/*
 * Under `output: "export"` a route handler has to say it is static, or the
 * build cannot collect robots.txt at all.
 */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
