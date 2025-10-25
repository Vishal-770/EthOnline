'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAccount, useBalance, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits, Address } from 'viem';
import { ArrowDownUp, Loader2, Settings } from 'lucide-react';
import { WalletButton } from './WalletButton';

interface CompactTradingProps {
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

export function CompactTrading({ 
  tokenAddress, 
  tokenSymbol, 
  tokenDecimals, 
  tokenPrice,
  tokenName 
}: CompactTradingProps) {
  const [isBuy, setIsBuy] = useState(true);
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [showSettings, setShowSettings] = useState(false);
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
    if (!inputAmount || !tokenPrice || parseFloat(inputAmount) <= 0 || tokenPrice <= 0) return '0';
    
    try {
      if (isBuy) {
        // ETH to Token
        const expectedTokens = parseFloat(inputAmount) / tokenPrice;
        return expectedTokens.toFixed(6);
      } else {
        // Token to ETH
        const expectedEth = parseFloat(inputAmount) * tokenPrice;
        return expectedEth.toFixed(6);
      }
    } catch (error) {
      console.error('Error calculating expected output:', error);
      return '0';
    }
  };

  // Check if approval is needed for selling tokens
  useEffect(() => {
    if (!isBuy && allowance && inputAmount && tokenDecimals) {
      try {
        const inputAmountWei = parseUnits(inputAmount, tokenDecimals);
        setNeedsApproval(allowance < inputAmountWei);
      } catch {
        setNeedsApproval(false);
      }
    } else {
      setNeedsApproval(false);
    }
  }, [allowance, inputAmount, isBuy, tokenDecimals]);

  // Handle approve
  const handleApprove = async () => {
    if (!inputAmount || !tokenDecimals) return;
    
    setIsApproving(true);
    try {
      const amountToApprove = parseUnits(inputAmount, tokenDecimals);
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
    if (!address || !inputAmount) return;

    setIsSwapping(true);
    try {
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes
      const slippageDecimal = parseFloat(slippage) / 100;

      if (isBuy) {
        // Buy tokens with ETH
        const ethAmountWei = parseUnits(inputAmount, 18);
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
        const tokenAmountWei = parseUnits(inputAmount, tokenDecimals);
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

  // Auto-calculate output amount when input changes
  useEffect(() => {
    if (inputAmount && tokenPrice && parseFloat(inputAmount) > 0) {
      try {
        const output = calculateExpectedOutput();
        setOutputAmount(output);
      } catch (error) {
        console.error('Error auto-calculating output:', error);
        setOutputAmount('');
      }
    } else {
      setOutputAmount('');
    }
  }, [inputAmount, isBuy, tokenPrice]);

  // Swap input/output tokens
  const handleSwapDirection = () => {
    setIsBuy(!isBuy);
    setInputAmount(outputAmount);
    setOutputAmount(inputAmount);
  };

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ArrowDownUp className="w-4 h-4" />
            <span className="text-sm font-semibold">Quick Trade</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Connect wallet to trade
            </p>
            <WalletButton />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowDownUp className="w-4 h-4" />
            <span className="text-sm font-semibold">Quick Trade</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="h-6 w-6 p-0"
          >
            <Settings className="w-3 h-3" />
          </Button>
        </div>
        {showSettings && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs">Slippage:</span>
            <Input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              className="w-16 h-6 text-xs text-center"
              step="0.1"
              min="0.1"
              max="50"
            />
            <span className="text-xs">%</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Input Token */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">From</span>
            <span className="text-xs text-muted-foreground">
              Balance: {isBuy 
                ? ethBalance ? parseFloat(formatUnits(ethBalance.value, 18)).toFixed(4) : '0'
                : tokenBalance ? parseFloat(formatUnits(tokenBalance.value, tokenDecimals)).toFixed(4) : '0'
              }
            </span>
          </div>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                type="number"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                placeholder="0.0"
                className="h-12 text-right pr-3"
              />
            </div>
            <div className="flex items-center justify-center min-w-[60px] bg-accent rounded-md px-2">
              <span className="text-xs font-medium">
                {isBuy ? 'ETH' : tokenSymbol}
              </span>
            </div>
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwapDirection}
            className="h-8 w-8 p-0 rounded-full"
          >
            <ArrowDownUp className="w-3 h-3" />
          </Button>
        </div>

        {/* Output Token */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">To</span>
            <span className="text-xs text-muted-foreground">
              Balance: {!isBuy 
                ? ethBalance ? parseFloat(formatUnits(ethBalance.value, 18)).toFixed(4) : '0'
                : tokenBalance ? parseFloat(formatUnits(tokenBalance.value, tokenDecimals)).toFixed(4) : '0'
              }
            </span>
          </div>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                type="number"
                value={outputAmount}
                placeholder="0.0"
                className="h-12 text-right pr-3"
                readOnly
              />
            </div>
            <div className="flex items-center justify-center min-w-[60px] bg-accent rounded-md px-2">
              <span className="text-xs font-medium">
                {!isBuy ? 'ETH' : tokenSymbol}
              </span>
            </div>
          </div>
        </div>

        {/* Price Info */}
        <div className="flex justify-between items-center text-xs text-muted-foreground bg-accent/30 rounded-md px-2 py-1">
          <span>Price:</span>
          <span>${tokenPrice.toFixed(6)}</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {!isBuy && needsApproval && (
            <Button
              onClick={handleApprove}
              disabled={isApproving || isApproveLoading || !inputAmount}
              className="w-full h-12"
              variant="outline"
            >
              {isApproving || isApproveLoading ? (
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
              (!isBuy && needsApproval) ||
              !inputAmount ||
              parseFloat(inputAmount) <= 0
            }
            className="w-full h-12"
          >
            {isSwapping || isSwapLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isBuy ? 'Buying...' : 'Selling...'}
              </>
            ) : (
              `${isBuy ? 'Buy' : 'Sell'} ${tokenSymbol}`
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}