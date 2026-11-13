import type { NextConfig } from "next";

// Static export, so GitHub Pages can host the site.
const nextConfig: NextConfig = {
  devIndicators: false, // hides the round "N" button of the dev server
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
