import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 'standalone' output is for Docker deployment
  // Vercel doesn't need this - it handles Next.js deployments automatically
  // Uncomment below if deploying to Docker, otherwise leave commented for Vercel
  // output: 'standalone',
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
    ],
    // Allow local uploads from public/uploads
    unoptimized: false,
  },
};

export default nextConfig;

