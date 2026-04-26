import type { NextConfig } from "next"

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: self + Next.js inline scripts (nonce not used — use unsafe-inline for now, tighten with nonces later)
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Styles: self + inline (Tailwind + Leaflet inject inline styles)
      "style-src 'self' 'unsafe-inline'",
      // Images: self + OSM tiles + data URIs (Leaflet marker icons)
      "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://cdnjs.cloudflare.com",
      // Fonts: self
      "font-src 'self' data:",
      // Connect: self + NWS API + Nominatim (API routes proxy these, but allow direct if needed)
      "connect-src 'self' https://api.weather.gov https://nominatim.openstreetmap.org",
      // Workers: self + blob (Leaflet uses blob workers)
      "worker-src 'self' blob:",
      // Frame: none
      "frame-src 'none'",
      "frame-ancestors 'none'",
      // Objects: none
      "object-src 'none'",
      // Base URI: self
      "base-uri 'self'",
      // Form action: self
      "form-action 'self'",
      // Upgrade insecure requests in production
      "upgrade-insecure-requests",
    ].join("; "),
  },
]

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      { hostname: "tile.openstreetmap.org" },
      { hostname: "*.tile.openstreetmap.org" },
      { hostname: "*.basemaps.cartocdn.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
