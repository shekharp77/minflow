import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Cloudflare Pages serves static assets, and Next does not run natively on
   * Workers. Every route here is already prerendered (68 component pages via
   * generateStaticParams, the rest static), so a static export loses nothing
   * and needs no adapter.
   */
  output: "export",
};

export default nextConfig;
