import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required by the production Docker image.
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
      {
        protocol: 'https',
        hostname: 'supabase.adeljs.dev',
      },
    ],
    // Allow local uploads from public/uploads
    unoptimized: false,
  },
};

export default nextConfig;
