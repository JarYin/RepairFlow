import path from "node:path";
import type { NextConfig } from "next";

// Without this, Next guesses the root from the lockfiles it finds, and files
// outside apps/web such as packages/contracts may fall outside what it traces.
const workspaceRoot = path.join(__dirname, "../..");

function resolveApiOrigin(): string {
  const configured = process.env.API_ORIGIN;
  if (configured) return new URL(configured).origin;
  if (process.env.NODE_ENV === "development") return "http://localhost:4000";
  throw new Error("API_ORIGIN must be set to build the Web");
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Next reads this while building, so the target is fixed in the build output.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${resolveApiOrigin()}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
