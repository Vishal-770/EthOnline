import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
