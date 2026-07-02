import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["pdf-parse", "canvas", "pdfjs-dist", "unpdf"],
};

export default nextConfig;
