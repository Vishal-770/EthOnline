/**
 * Mock DEX Service for Testing MemeSentinel
 * This provides sample data for testing without relying on external APIs
 */

import { MemecoinData } from '../types';

export class MockDEXService {
  private static mockTokens: MemecoinData[] = [
    {
      address: '0x1234567890123456789012345678901234567890',
      symbol: 'PEPE',
      name: 'Pepe Token',
      dex: 'Uniswap V3',
      pairAddress: '0x1111111111111111111111111111111111111111',
      token0: '0x1234567890123456789012345678901234567890',
      token1: '0xA0b86a33E6441bE4d924465B2472ddE05deB03D0', // WETH
      createdAt: Date.now() - 3600000, // 1 hour ago
      discoveredAt: Date.now(),
      timestamp: Date.now()
    },
    {
      address: '0x2345678901234567890123456789012345678901',
      symbol: 'DOGE',
      name: 'Dogecoin Token',
      dex: 'Uniswap V2',
      pairAddress: '0x2222222222222222222222222222222222222222',
      token0: '0x2345678901234567890123456789012345678901',
      token1: '0xA0b86a33E6441bE4d924465B2472ddE05deB03D0', // WETH
      createdAt: Date.now() - 1800000, // 30 minutes ago
      discoveredAt: Date.now(),
      timestamp: Date.now()
    },
    {
      address: '0x3456789012345678901234567890123456789012',
      symbol: 'SHIB',
      name: 'Shiba Inu Token',
      dex: 'SaucerSwap',
      pairAddress: '0x3333333333333333333333333333333333333333',
      token0: '0x3456789012345678901234567890123456789012',
      token1: '0x0000000000000000000000000000000000000000', // HBAR
      createdAt: Date.now() - 900000, // 15 minutes ago
      discoveredAt: Date.now(),
      timestamp: Date.now()
    }
  ];

  static getNewPairs(minutesAgo: number = 60): MemecoinData[] {
    const cutoffTime = Date.now() - (minutesAgo * 60 * 1000);
    return this.mockTokens.filter(token => (token.createdAt || 0) > cutoffTime);
  }

  static addRandomToken(): MemecoinData {
    const symbols = ['MOON', 'ROCKET', 'DIAMOND', 'HODL', 'WAGMI', 'BASED', 'CHAD', 'ALPHA'];
    const names = ['Moon Token', 'Rocket Token', 'Diamond Hands', 'HODL Token', 'We All Gonna Make It', 'Based Token', 'Chad Token', 'Alpha Token'];
    
    const randomIndex = Math.floor(Math.random() * symbols.length);
    const timestamp = Date.now();
    
    const newToken: MemecoinData = {
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      symbol: symbols[randomIndex],
      name: names[randomIndex],
      dex: Math.random() > 0.5 ? 'Uniswap V3' : 'SaucerSwap',
      pairAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      token0: `0x${Math.random().toString(16).substr(2, 40)}`,
      token1: '0xA0b86a33E6441bE4d924465B2472ddE05deB03D0',
      createdAt: timestamp - Math.floor(Math.random() * 3600000), // Random time in last hour
      discoveredAt: timestamp,
      timestamp: timestamp
    };

    this.mockTokens.push(newToken);
    return newToken;
  }

  static getAllTokens(): MemecoinData[] {
    return [...this.mockTokens];
  }

  static simulateNewTokenDiscovery(): MemecoinData | null {
    // 30% chance of finding a new token each time
    if (Math.random() > 0.7) {
      return this.addRandomToken();
    }
    return null;
  }
}