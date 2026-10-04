import type { NextConfig } from "next"

/* The three original campaign pages are plain HTML in /public and stay
   byte-identical while ads still point at them. These rewrites give them back
   the clean URLs they had before the move to Next.js. */
const legacyPages = [
  { source: "/", destination: "/index.html" },
  { source: "/lift", destination: "/lift/index.html" },
  { source: "/nonsurgical-lift", destination: "/nonsurgical-lift/index.html" },
]

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    return { beforeFiles: legacyPages, afterFiles: [], fallback: [] }
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
      // Same caching the original pages had for their images.
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ]
  },
}

export default nextConfig
