import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        "@envio-dev/hypersync-client",
      ];
    } else {
      // For client-side, don't include the module
      config.resolve.alias = {
        ...config.resolve.alias,
        "@envio-dev/hypersync-client": false,
      };
    }
    return config;
  },
  images: {
    domains: [
      "dd.dexscreener.com",
      "cdn.dexscreener.com", // ✅ Add this line
    ],
  },
};

export default nextConfig;
