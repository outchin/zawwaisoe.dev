import type { NextConfig } from "next";

// The labs (github.com/outchin/nestjs-recipe) are a separate app on their own Vercel
// project. /labs/* on this domain is forwarded there, so both look like one site but
// deploy independently. LABS_ORIGIN = that project's URL, e.g. https://<labs>.vercel.app
const labsOrigin = process.env.LABS_ORIGIN?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Posts whose slug had a typo; old links keep working.
  async redirects() {
    return [
      { source: "/blog/kuber-api-server", destination: "/blog/kube-api-server", permanent: true },
      { source: "/blog/limitrange-resource-quoata", destination: "/blog/limitrange-resource-quota", permanent: true },
    ];
  },
  async rewrites() {
    if (!labsOrigin) return [];
    return [
      { source: "/labs", destination: `${labsOrigin}/labs` },
      { source: "/labs/:path*", destination: `${labsOrigin}/labs/:path*` },
    ];
  },
};

export default nextConfig;
