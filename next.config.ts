import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: "/terms-conditions",
        destination: "/terms-of-service",
        permanent: true,
      },
      {
        source: "/privacy-policy",
        destination: "/privacy",
        permanent: true,
      },
      {
        source: "/cookie-policy",
        destination: "/privacy",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sfcc.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.sfcc.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "techexpo2025.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "bfs2025.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "youtube.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        pathname: "/**",
      },
      // Allow ALL images in development only
      ...(process.env.NODE_ENV === "development"
        ? [
            {
              protocol: "https",
              hostname: "**",
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
