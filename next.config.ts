import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep React's additional development checks enabled.
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.widgety.co.uk",
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
