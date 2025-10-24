import axios from 'axios';
import { ethers } from 'ethers';
import { RiskData } from '../types';

export class RiskAnalysisService {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    const rpcUrl = process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/your-infura-key';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  async analyzeRisk(tokenAddress: string): Promise<RiskData> {
    try {
      console.log(`🔍 Analyzing risk for token: ${tokenAddress}`);

      const [
        contractAnalysis,
        ownershipAnalysis,
        socialAnalysis,
        honeypotAnalysis
      ] = await Promise.allSettled([
        this.analyzeContract(tokenAddress),
        this.analyzeOwnership(tokenAddress),
        this.analyzeSocialMetrics(tokenAddress),
        this.checkHoneypot(tokenAddress)
      ]);

      return this.calculateRiskScore(
        tokenAddress,
        contractAnalysis.status === 'fulfilled' ? contractAnalysis.value : null,
        ownershipAnalysis.status === 'fulfilled' ? ownershipAnalysis.value : null,
        socialAnalysis.status === 'fulfilled' ? socialAnalysis.value : null,
        honeypotAnalysis.status === 'fulfilled' ? honeypotAnalysis.value : false
      );
    } catch (error) {
      console.error(`❌ Error analyzing risk for ${tokenAddress}:`, error);
      return this.getDefaultRiskData(tokenAddress);
    }
  }

  private async analyzeContract(tokenAddress: string): Promise<any> {
    try {
      // For demo tokens (DefiLlama and CoinGecko IDs), return mock contract data
      if (tokenAddress.startsWith('dl-') || tokenAddress.startsWith('cg-')) {
        console.log(`📝 Using mock contract analysis for demo token: ${tokenAddress}`);
        return {
          isContract: true,
          hasBasicFunctions: true,
          totalSupply: '1000000000000000000000000', // 1M tokens with 18 decimals
          decimals: 18,
          verified: false, // Demo tokens aren't verified
          codeSize: 1000 // Mock code size
        };
      }

      // For real Ethereum addresses, perform actual contract analysis
      const code = await this.provider.getCode(tokenAddress);
      
      if (code === '0x') {
        throw new Error('No contract found at address');
      }

      // Basic ERC20 interface check
      const erc20Interface = new ethers.Interface([
        'function totalSupply() view returns (uint256)',
        'function balanceOf(address) view returns (uint256)',
        'function transfer(address, uint256) returns (bool)',
        'function allowance(address, address) view returns (uint256)',
        'function approve(address, uint256) returns (bool)',
        'function transferFrom(address, address, uint256) returns (bool)'
      ]);

      const contract = new ethers.Contract(tokenAddress, erc20Interface, this.provider);

      // Check basic functions
      const [totalSupply, decimals] = await Promise.allSettled([
        contract.totalSupply(),
        contract.decimals?.() || Promise.resolve(18)
      ]);

      // Try to get contract verification status from Etherscan
      const verified = await this.checkContractVerification(tokenAddress);

      return {
        isContract: true,
        hasBasicFunctions: true,
        totalSupply: totalSupply.status === 'fulfilled' ? totalSupply.value.toString() : '0',
        decimals: decimals.status === 'fulfilled' ? decimals.value : 18,
        verified,
        codeSize: code.length
      };
    } catch (error) {
      console.error('❌ Contract analysis error:', error);
      return {
        isContract: false,
        hasBasicFunctions: false,
        verified: false,
        codeSize: 0
      };
    }
  }

  private async checkContractVerification(tokenAddress: string): Promise<boolean> {
    try {
      // Use a public API to check verification (simplified)
      const response = await axios.get(`https://api.etherscan.io/api`, {
        params: {
          module: 'contract',
          action: 'getsourcecode',
          address: tokenAddress,
          apikey: process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken'
        }
      });

      return response.data.result?.[0]?.SourceCode !== '';
    } catch (error) {
      console.error('❌ Contract verification check error:', error);
      return false;
    }
  }

  private async analyzeOwnership(tokenAddress: string): Promise<any> {
    try {
      // Common ownership functions to check
      const ownerInterface = new ethers.Interface([
        'function owner() view returns (address)',
        'function renounceOwnership() public',
        'function transferOwnership(address) public'
      ]);

      const contract = new ethers.Contract(tokenAddress, ownerInterface, this.provider);

      let owner = null;
      let ownerRenounced = false;

      try {
        owner = await contract.owner();
        ownerRenounced = owner === ethers.ZeroAddress;
      } catch (error) {
        // No owner function or contract doesn't implement ownership
        ownerRenounced = true; // Assume safer if no owner
      }

      return {
        hasOwner: owner !== null,
        owner,
        ownerRenounced
      };
    } catch (error) {
      console.error('❌ Ownership analysis error:', error);
      return {
        hasOwner: false,
        owner: null,
        ownerRenounced: true
      };
    }
  }

  private async analyzeSocialMetrics(tokenAddress: string): Promise<any> {
    try {
      // Mock social analysis - in real implementation, integrate with:
      // - Twitter API for mentions/sentiment
      // - Telegram API for group activity
      // - Reddit API for discussions
      // - GitHub for development activity

      // For now, return mock data
      return {
        twitterMentions: Math.floor(Math.random() * 1000),
        telegramMembers: Math.floor(Math.random() * 5000),
        redditScore: Math.floor(Math.random() * 100),
        githubActivity: Math.floor(Math.random() * 50),
        sentimentScore: Math.random() * 100 // 0-100
      };
    } catch (error) {
      console.error('❌ Social analysis error:', error);
      return {
        twitterMentions: 0,
        telegramMembers: 0,
        redditScore: 0,
        githubActivity: 0,
        sentimentScore: 50
      };
    }
  }

  private async checkHoneypot(tokenAddress: string): Promise<boolean> {
    try {
      // Simulate a small trade to check if token can be sold
      // This is a simplified check - real implementation would be more sophisticated
      
      // Check if there are any transfer restrictions
      const transferInterface = new ethers.Interface([
        'function transfer(address to, uint256 amount) returns (bool)'
      ]);

      // For now, return false (not a honeypot)
      // Real implementation would simulate trades or check for transfer restrictions
      return false;
    } catch (error) {
      console.error('❌ Honeypot check error:', error);
      return true; // Assume risky if check fails
    }
  }

  private calculateRiskScore(
    tokenAddress: string,
    contractAnalysis: any,
    ownershipAnalysis: any,
    socialAnalysis: any,
    honeypotRisk: boolean
  ): RiskData {
    let riskScore = 0;
    
    // Contract verification (20% weight)
    if (!contractAnalysis?.verified) {
      riskScore += 20;
    }

    // Ownership analysis (30% weight)
    if (!ownershipAnalysis?.ownerRenounced) {
      riskScore += 30;
    }

    // Honeypot risk (25% weight)
    if (honeypotRisk) {
      riskScore += 25;
    }

    // Social metrics (25% weight)
    const socialScore = socialAnalysis?.sentimentScore || 50;
    if (socialScore < 30) {
      riskScore += 25;
    } else if (socialScore < 50) {
      riskScore += 15;
    } else if (socialScore < 70) {
      riskScore += 5;
    }

    // Calculate viral potential based on social metrics
    const viralPotential = Math.min(
      (socialAnalysis?.twitterMentions || 0) / 10 +
      (socialAnalysis?.telegramMembers || 0) / 100 +
      (socialAnalysis?.redditScore || 0),
      100
    );

    return {
      tokenAddress,
      riskScore: Math.min(riskScore, 100),
      rugRisk: riskScore > 60,
      ownerRenounced: ownershipAnalysis?.ownerRenounced || false,
      mintPermissions: !ownershipAnalysis?.ownerRenounced, // Simplified assumption
      viralPotential,
      socialScore: socialAnalysis?.sentimentScore || 50,
      contractVerified: contractAnalysis?.verified || false,
      honeypotRisk,
      timestamp: Date.now()
    };
  }

  private getDefaultRiskData(tokenAddress: string): RiskData {
    return {
      tokenAddress,
      riskScore: 80, // High risk if analysis fails
      rugRisk: true,
      ownerRenounced: false,
      mintPermissions: true,
      viralPotential: 0,
      socialScore: 0,
      contractVerified: false,
      honeypotRisk: true,
      timestamp: Date.now()
    };
  }

  async getBatchRiskAnalysis(tokenAddresses: string[]): Promise<RiskData[]> {
    const results: RiskData[] = [];
    const batchSize = 5; // Process in batches to avoid rate limits

    for (let i = 0; i < tokenAddresses.length; i += batchSize) {
      const batch = tokenAddresses.slice(i, i + batchSize);
      const batchPromises = batch.map(address => this.analyzeRisk(address));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        const validResults = batchResults
          .filter(result => result.status === 'fulfilled')
          .map(result => (result as PromiseFulfilledResult<RiskData>).value);
        
        results.push(...validResults);
        
        // Small delay between batches
        if (i + batchSize < tokenAddresses.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`❌ Batch risk analysis error for batch starting at ${i}:`, error);
      }
    }

    return results;
  }
}