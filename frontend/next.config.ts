import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const parsedApiUrl = new URL(rawApiUrl);

const nextConfig: NextConfig = {
  output: "standalone",
  // Leaflet calls L.map(el) on mount; Strict Mode's double-mount in dev leaves
  // _leaflet_id on the element from the first mount, causing "already initialized"
  // on the second. This is the standard fix for Leaflet + React apps.
  reactStrictMode: false,
  images: {
    // In development, NEXT_PUBLIC_API_URL is localhost which resolves to a private
    // IP (127.0.0.1) inside the Docker container. Next.js blocks private IPs as an
    // SSRF protection, so image optimization would fail. We disable it in dev and
    // rely on the browser fetching images directly instead.
    // In production, NEXT_PUBLIC_API_URL is a real public domain so optimization
    // works normally with the remotePatterns allowlist below.
    unoptimized: isDev,
    remotePatterns: isDev
      ? []
      : [
          {
            protocol: parsedApiUrl.protocol.replace(":", "") as "http" | "https",
            hostname: parsedApiUrl.hostname,
            port: parsedApiUrl.port,
            pathname: "/**",
          },
        ],
  },
};

export default nextConfig;
