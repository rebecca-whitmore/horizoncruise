import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep React's additional development checks enabled.
  reactStrictMode: true,
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
