import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  typescript: {
    // ⚠️ Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },

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

    // Fix for @react-native-async-storage/async-storage in browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@react-native-async-storage/async-storage": false,
    };

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
