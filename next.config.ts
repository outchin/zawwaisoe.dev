import type { NextConfig } from "next";

// The labs (github.com/outchin/nestjs-recipe) are a separate app on their own Vercel
// project. /labs/* on this domain is forwarded there, so both look like one site but
// deploy independently. LABS_ORIGIN = that project's URL, e.g. https://<labs>.vercel.app
const labsOrigin = process.env.LABS_ORIGIN?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!labsOrigin) return [];
    return [
      { source: "/labs", destination: `${labsOrigin}/labs` },
      { source: "/labs/:path*", destination: `${labsOrigin}/labs/:path*` },
    ];
  },
};

export default nextConfig;
