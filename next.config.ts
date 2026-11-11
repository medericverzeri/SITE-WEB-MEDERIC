import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    tsconfigPath: "tsconfig.json",
  },
  outputFileTracingIncludes: {
    "/*": ["./src/db/bootstrap.sql"],
  },
  turbopack: {
    // Le projet exporté est autonome : ne pas déduire sa racine d’un dossier parent.
    root: process.cwd(),
  },
};

export default nextConfig;
