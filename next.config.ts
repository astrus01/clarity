import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Maximum duration for agent execution (5 minutes)
  experimental: {
    serverComponentsExternalPackages: ["three", "@react-three/fiber"],
  },
};

export default nextConfig;
