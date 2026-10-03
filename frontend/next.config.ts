import type { NextConfig } from "next";

const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000");

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Product / category images uploaded through the admin land here.
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        // New uploads are served from MongoDB GridFS through the API.
        protocol: apiUrl.protocol.slice(0, -1) as "http" | "https",
        hostname: apiUrl.hostname,
        port: apiUrl.port,
        pathname: "/api/uploads/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
