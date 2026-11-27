import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
  async rewrites() {
    const apiInterna = process.env.API_INTERNAL_URL || "http://localhost:8080/api";
    return [{ source: "/api/:path*", destination: `${apiInterna}/:path*` }];
  },
};

export default nextConfig;
