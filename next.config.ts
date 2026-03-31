import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1", "http://127.0.0.1:3000", "localhost", "http://localhost:3000"]
};

export default nextConfig;
