import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(/*turbopackIgnore: true*/ __dirname, ".."),
  outputFileTracingIncludes: {
    "/*": ["../registry/datasets/**/*"],
  },
};

export default nextConfig;
