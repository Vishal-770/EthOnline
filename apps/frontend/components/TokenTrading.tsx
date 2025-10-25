'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAccount, useBalance, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits, Address } from 'viem';
import { ArrowDownUp, Loader2, TrendingUp, TrendingDown, Settings, Info } from 'lucide-react';
import { WalletButton } from './WalletButton';

interface TokenTradingProps {
  tokenAddress: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenPrice: number;
  tokenName: string;
}

// Uniswap V2 Router ABI (simplified)
const UNISWAP_V2_ROUTER_ABI = [
  {
    inputs: [
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' },
    ],
    name: 'swapExactETHForTokens',
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' },
    ],
    name: 'swapExactTokensForETH',
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'path', type: 'address[]' },
    ],
    name: 'getAmountsOut',
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// ERC20 ABI (simplified)
const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Contract addresses
const UNISWAP_V2_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

export function TokenTrading({ 
  tokenAddress, 
  tokenSymbol, 
  tokenDecimals, 
  tokenPrice,
  tokenName 
}: TokenTradingProps) {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [ethAmount, setEthAmount] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5'); // 0.5%
  const [isApproving, setIsApproving] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);

  const { address, isConnected } = useAccount();
  
  // Get ETH balance
  const { data: ethBalance } = useBalance({
    address,
  });

  // Get token balance
  const { data: tokenBalance } = useBalance({
    address,
    token: tokenAddress as Address,
  });

  // Get token allowance
  const { data: allowance } = useReadContract({
    address: tokenAddress as Address,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && [address, UNISWAP_V2_ROUTER as Address],
    query: { enabled: !!address },
  });

  // Contract write hooks
  const { writeContract: writeApprove, data: approveHash } = useWriteContract();
  const { writeContract: writeSwap, data: swapHash } = useWriteContract();

  // Transaction receipts
  const { isLoading: isApproveLoading } = useWaitForTransactionReceipt({
    hash: approveHash,
  });
  
  const { isLoading: isSwapLoading } = useWaitForTransactionReceipt({
    hash: swapHash,
  });

  // Calculate expected output
  const calculateExpectedOutput = () => {
    if (activeTab === 'buy' && ethAmount && tokenPrice > 0) {
      // ETH to Token
      const expectedTokens = parseFloat(ethAmount) / tokenPrice;
      return expectedTokens.toFixed(6);
    } else if (activeTab === 'sell' && tokenAmount && tokenPrice > 0) {
      // Token to ETH
      const expectedEth = parseFloat(tokenAmount) * tokenPrice;
      return expectedEth.toFixed(6);
    }
    return '0';
  };

  // Check if approval is needed
  useEffect(() => {
    if (activeTab === 'sell' && allowance && tokenAmount) {
      const tokenAmountWei = parseUnits(tokenAmount, tokenDecimals);
      setNeedsApproval(allowance < tokenAmountWei);
    } else {
      setNeedsApproval(false);
    }
  }, [allowance, tokenAmount, activeTab, tokenDecimals]);

  // Handle approve
  const handleApprove = async () => {
    if (!tokenAmount) return;
    
    setIsApproving(true);
    try {
      const amountToApprove = parseUnits(tokenAmount, tokenDecimals);
      writeApprove({
        address: tokenAddress as Address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [UNISWAP_V2_ROUTER as Address, amountToApprove],
      });
    } catch (error) {
      console.error('Approval failed:', error);
    } finally {
      setIsApproving(false);
    }
  };

  // Handle swap
  const handleSwap = async () => {
    if (!address) return;

    setIsSwapping(true);
    try {
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes
      const slippageDecimal = parseFloat(slippage) / 100;

      if (activeTab === 'buy') {
        // Buy tokens with ETH
        const ethAmountWei = parseUnits(ethAmount, 18);
        const expectedTokens = parseFloat(calculateExpectedOutput());
        const minTokensOut = parseUnits(
          (expectedTokens * (1 - slippageDecimal)).toString(),
          tokenDecimals
        );

        writeSwap({
          address: UNISWAP_V2_ROUTER as Address,
          abi: UNISWAP_V2_ROUTER_ABI,
          functionName: 'swapExactETHForTokens',
          args: [
            minTokensOut,
            [WETH_ADDRESS as Address, tokenAddress as Address],
            address,
            BigInt(deadline),
          ],
          value: ethAmountWei,
        });
      } else {
        // Sell tokens for ETH
        const tokenAmountWei = parseUnits(tokenAmount, tokenDecimals);
        const expectedEth = parseFloat(calculateExpectedOutput());
        const minEthOut = parseUnits(
          (expectedEth * (1 - slippageDecimal)).toString(),
          18
        );

        writeSwap({
          address: UNISWAP_V2_ROUTER as Address,
          abi: UNISWAP_V2_ROUTER_ABI,
          functionName: 'swapExactTokensForETH',
          args: [
            tokenAmountWei,
            minEthOut,
            [tokenAddress as Address, WETH_ADDRESS as Address],
            address,
            BigInt(deadline),
          ],
        });
      }
    } catch (error) {
      console.error('Swap failed:', error);
    } finally {
      setIsSwapping(false);
    }
  };

  // Auto-calculate opposite amount when one changes
  useEffect(() => {
    if (activeTab === 'buy' && ethAmount) {
      const expectedTokens = calculateExpectedOutput();
      setTokenAmount(expectedTokens);
    }
  }, [ethAmount, activeTab, tokenPrice]);

  useEffect(() => {
    if (activeTab === 'sell' && tokenAmount) {
      const expectedEth = calculateExpectedOutput();
      setEthAmount(expectedEth);
    }
  }, [tokenAmount, activeTab, tokenPrice]);

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownUp className="w-5 h-5" />
            Trade {tokenSymbol}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <p className="text-muted-foreground text-center">
            Connect your wallet to start trading
          </p>
          <WalletButton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowDownUp className="w-5 h-5" />
          Trade {tokenSymbol}
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Current Price: ${tokenPrice.toFixed(6)}
          </div>
          <Badge variant="outline" className="text-xs">
            Slippage: {slippage}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'buy' | 'sell')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Buy {tokenSymbol}
            </TabsTrigger>
            <TabsTrigger value="sell" className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Sell {tokenSymbol}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Pay (ETH)
              </label>
              <Input
                type="number"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                placeholder="0.0"
                className="text-right"
              />
              <div className="text-xs text-muted-foreground">
                Balance: {ethBalance ? parseFloat(formatUnits(ethBalance.value, 18)).toFixed(6) : '0'} ETH
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowDownUp className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Receive ({tokenSymbol})
              </label>
              <Input
                type="number"
                value={calculateExpectedOutput()}
                readOnly
                placeholder="0.0"
                className="text-right bg-muted"
              />
              <div className="text-xs text-muted-foreground">
                Balance: {tokenBalance ? parseFloat(formatUnits(tokenBalance.value, tokenDecimals)).toFixed(6) : '0'} {tokenSymbol}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sell" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Sell ({tokenSymbol})
              </label>
              <Input
                type="number"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                placeholder="0.0"
                className="text-right"
              />
              <div className="text-xs text-muted-foreground">
                Balance: {tokenBalance ? parseFloat(formatUnits(tokenBalance.value, tokenDecimals)).toFixed(6) : '0'} {tokenSymbol}
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowDownUp className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Receive (ETH)
              </label>
              <Input
                type="number"
                value={calculateExpectedOutput()}
                readOnly
                placeholder="0.0"
                className="text-right bg-muted"
              />
              <div className="text-xs text-muted-foreground">
                Balance: {ethBalance ? parseFloat(formatUnits(ethBalance.value, 18)).toFixed(6) : '0'} ETH
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Slippage Settings */}
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <Settings className="w-4 h-4" />
          <span className="text-sm">Slippage tolerance:</span>
          <Input
            type="number"
            value={slippage}
            onChange={(e) => setSlippage(e.target.value)}
            className="w-20 h-8 text-center"
            step="0.1"
            min="0.1"
            max="50"
          />
          <span className="text-sm">%</span>
        </div>

        {/* Transaction Buttons */}
        <div className="space-y-2">
          {activeTab === 'sell' && needsApproval && (
            <Button
              onClick={handleApprove}
              disabled={isApproving || isApproveLoading}
              className="w-full"
              variant="outline"
            >
              {(isApproving || isApproveLoading) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                `Approve ${tokenSymbol}`
              )}
            </Button>
          )}

          <Button
            onClick={handleSwap}
            disabled={
              isSwapping || 
              isSwapLoading || 
              (activeTab === 'sell' && needsApproval) ||
              (activeTab === 'buy' && !ethAmount) ||
              (activeTab === 'sell' && !tokenAmount)
            }
            className="w-full"
          >
            {(isSwapping || isSwapLoading) ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Swapping...
              </>
            ) : (
              `${activeTab === 'buy' ? 'Buy' : 'Sell'} ${tokenSymbol}`
            )}
          </Button>
        </div>

        {/* Price Impact Info */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <Info className="w-4 h-4 text-blue-600" />
          <div className="text-xs text-blue-600">
            <div>Price impact: ~{slippage}%</div>
            <div>Network fees will apply</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}