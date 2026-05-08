import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint during build (optional, if you have lint errors)
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  // Disable TypeScript errors during build (optional)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
