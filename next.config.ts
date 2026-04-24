import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      { hostname: "tile.openstreetmap.org" },
      { hostname: "*.tile.openstreetmap.org" },
      { hostname: "*.basemaps.cartocdn.com" },
    ],
  },
}

export default nextConfig
