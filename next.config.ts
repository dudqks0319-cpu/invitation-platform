import path from "node:path";
import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseStoragePattern = (() => {
  if (!supabaseUrl) {
    return [];
  }

  try {
    const url = new URL(supabaseUrl);
    return [
      {
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        pathname: "/storage/v1/object/public/**"
      }
    ];
  } catch {
    return [];
  }
})();

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: supabaseStoragePattern
  },
  turbopack: {
    root: path.resolve(__dirname)
  }
};

export default nextConfig;
