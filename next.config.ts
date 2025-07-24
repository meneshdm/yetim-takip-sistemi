import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Build sırasında scripts klasörünü ignore et
    ignoreBuildErrors: false,
  },
  eslint: {
    // Build sırasında scripts klasörünü ignore et
    ignoreDuringBuilds: false,
    dirs: ['src'], // Sadece src klasörünü lint et
  },
  serverExternalPackages: ['@prisma/client', 'prisma']
};

export default nextConfig;
