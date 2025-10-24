/**
 * Environment configuration for the frontend application
 * Centralizes all environment variable access
 */

// Validate required environment variables
const requiredEnvVars = ["NEXT_PUBLIC_ENVIO_API_URL"] as const;

// Validate on build (not on runtime for optional vars)
if (process.env.NODE_ENV === "production") {
  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      console.warn(`Warning: ${envVar} is not set in environment variables`);
    }
  });
}

export const env = {
  // Backend API
  envioApiUrl: process.env.NEXT_PUBLIC_ENVIO_API_URL || "http://localhost:3001",

  // External APIs
  twitterApiKey: process.env.NEXT_PUBLIC_TWITTER_API_KEY || "",
  twitterApiUrl:
    process.env.NEXT_PUBLIC_TWITTER_API_URL || "https://api.twitterapi.io",

  // Blockchain explorers
  etherscanUrl: process.env.NEXT_PUBLIC_ETHERSCAN_URL || "https://etherscan.io",

  // Third-party widgets
  moralisChartUrl:
    process.env.NEXT_PUBLIC_MORALIS_CHART_URL ||
    "https://moralis.com/static/embed/chart.js",
} as const;

// Helper function to get full API endpoint
export const getApiEndpoint = (path: string): string => {
  const baseUrl = env.envioApiUrl.replace(/\/$/, ""); // Remove trailing slash
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// Helper function to get Etherscan link
export const getEtherscanLink = (
  type: "tx" | "address" | "token",
  value: string
): string => {
  return `${env.etherscanUrl}/${type}/${value}`;
};
