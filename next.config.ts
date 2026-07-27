import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Do NOT set `output: "export"` — Vercel needs the Next.js server build.
  images: {
    // Local /covers/* via next/image; external cover URLs use <img> in CoverCard
    remotePatterns: [
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "drive.usercontent.google.com" },
      { protocol: "https", hostname: "i.imgur.com" },
    ],
  },
};

export default nextConfig;
