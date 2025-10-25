import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';

// Get project ID from environment variables
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. Please get one from https://cloud.walletconnect.com/');
}

export const config = getDefaultConfig({
  appName: 'ERC20WIZ Trading',
  projectId: projectId || 'default-project-id', // Fallback for development
  chains: [mainnet, polygon, optimism, arbitrum, base, ...(process.env.NODE_ENV === 'development' ? [sepolia] : [])],
  ssr: true, // If your dApp uses server side rendering (SSR)
});