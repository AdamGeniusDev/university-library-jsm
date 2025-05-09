import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["m.media-amazon.com", "placehold.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: ""
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: ''
      }
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
