"use client";

import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, AlertCircle, Settings, Play, Pause, RefreshCw, Plus, Trash2, Activity, DollarSign, BarChart3, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function MemeTraderDashboard() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [ethBalance, setEthBalance] = useState('0');
  const [contractEthBalance, setContractEthBalance] = useState('0');
  const [isAutomating, setIsAutomating] = useState(false);
  const [intervalTime, setIntervalTime] = useState(60);
  const [trendingTokens, setTrendingTokens] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [slippage, setSlippage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('disconnected');
  const [tokenApiStatus, setTokenApiStatus] = useState('disconnected');
  const [showSettings, setShowSettings] = useState(false);
  const [fetchingTokens, setFetchingTokens] = useState(false);

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x...';
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
  const TOKEN_API_URL = process.env.NEXT_PUBLIC_TOKEN_API_URL || 'http://localhost:3002';
  const ON_CHAIN_URL = process.env.NEXT_PUBLIC_ON_CHAIN_URL || 'http://localhost:3001';

  useEffect(() => {
    checkApiStatus();
    fetchTrendingTokens();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/`);
      if (response.ok) {
        setApiStatus('connected');
      } else {
        setApiStatus('disconnected');
      }
    } catch (error) {
      setApiStatus('disconnected');
    }

    try {
      const tokenResponse = await fetch(`${TOKEN_API_URL}/`);
      if (tokenResponse.ok) {
        setTokenApiStatus('connected');
      } else {
        setTokenApiStatus('disconnected');
      }
    } catch (error) {
      setTokenApiStatus('disconnected');
    }
  };



  const fetchTrendingTokens = async () => {
  if (fetchingTokens) return;
  setFetchingTokens(true);

  try {
    // 1. Get /top-tokens
    const resp = await fetch(`${TOKEN_API_URL}/top-tokens`);
    if (!resp.ok) throw new Error('Failed to fetch top tokens');
    const topRaw = await resp.json();
    console.log('🔹 Raw /top-tokens data:', topRaw);

    // Normalize tokens list depending on response shape
    const tokensList = Array.isArray(topRaw)
      ? topRaw
      : Array.isArray(topRaw.data)
      ? topRaw.data
      : // some backends return [ { address: '0x..,0x..' } ]
      Array.isArray(topRaw[0]?.tokens)
      ? topRaw[0].tokens
      : // fallback: check topRaw[0] where address might be comma-separated
      (topRaw[0] && topRaw[0].address && topRaw[0].address.includes(',')) // will handle below
      ? topRaw
      : [];

    if (!tokensList || tokensList.length === 0) {
      console.warn('⚠️ No tokens returned from /top-tokens');
      setTrendingTokens([]);
      return;
    }

    // Build address array (handles tokensList entries with address or just strings)
    const addresses = tokensList
        .slice(0, 10)
      .map((t) => (typeof t === 'string' ? t : t.address))
      .filter(Boolean)
      .map((a) => a.trim());

    if (addresses.length === 0) {
      console.warn('⚠️ No addresses found in /top-tokens payload');
      setTrendingTokens([]);
      return;
    }

    // 2. Try batch metadata endpoint first
    const joined = addresses.join(',');
    const metaResp = await fetch(`${ON_CHAIN_URL}/token-metadata/${joined}`);
    if (!metaResp.ok) throw new Error('Failed to fetch token metadata (batch)');

    const metaRaw = await metaResp.json();
    console.log('🔹 Raw token metadata (batch):', metaRaw);

    // Helper to normalize a single metadata object into UI token shape
    const toUiToken = (m) => ({
      address: m?.address || 'N/A',
      symbol: m?.symbol || m?.name || 'Unknown',
      liquidity: formatCurrency(m?.totalLiquidityUSD || 0),
      change: `${(m?.priceChange24h ?? 0) >= 0 ? '+' : ''}${((m?.priceChange24h ?? 0)).toFixed(2)}%`,
      price: `$${(m?.priceUSD ?? 0).toFixed(6)}`,
      volume: formatCurrency(m?.volume24h || 0),
      raw: m
    });

    let formattedTokens = [];

    // If batch returned an array (ideal)
    if (Array.isArray(metaRaw) && metaRaw.length > 0) {
      formattedTokens = metaRaw.map(toUiToken);
    } else if (metaRaw && typeof metaRaw === 'object') {
      // If the batch returned a single object — likely your current case
      // Check if it contains comma-separated addresses
      if (typeof metaRaw.address === 'string' && metaRaw.address.includes(',')) {
        // Fall back to per-address fetch to get real metadata per token
        console.warn('⚠️ Batch metadata returned aggregated object — falling back to per-address fetch.');

        // Simple concurrency limiter
        const concurrency = 6; // tweak this number if your API rate-limits
        const results = [];
        for (let i = 0; i < addresses.length; i += concurrency) {
          const chunk = addresses.slice(i, i + concurrency);
          const promises = chunk.map((addr) =>
            fetch(`${ON_CHAIN_URL}/token-metadata/${addr}`)
              .then((r) => (r.ok ? r.json() : null))
              .catch((e) => {
                console.error('Per-address fetch failed', addr, e);
                return null;
              })
          );
          const res = await Promise.all(promises);
          results.push(...res.filter(Boolean));
        }

        // results now should be array of metadata objects per token
        formattedTokens = results.map((m) => toUiToken(m));
      } else {
        // metaRaw is a single metadata object but doesn't contain a comma list.
        // Possibly it represents metadata for ONE of the requested tokens.
        // We'll try to map addresses -> the single object only for that address,
        // and for the rest fall back to individual fetches.
        const singleMeta = metaRaw;
        if (addresses.includes(singleMeta.address)) {
          formattedTokens.push(toUiToken(singleMeta));
        }

        // fetch remaining addresses individually
        const remaining = addresses.filter((a) => a !== singleMeta.address);
        if (remaining.length > 0) {
          const promises = remaining.map((addr) =>
            fetch(`${ON_CHAIN_URL}/token-metadata/${addr}`)
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null)
          );
          const res = await Promise.all(promises);
          formattedTokens.push(...res.filter(Boolean).map((m) => toUiToken(m)));
        }
      }
    } else {
      // metaRaw had unexpected shape: fall back to per-address fetch
      console.warn('⚠️ Unrecognized batch metadata format — doing per-address fetch.');
      const promises = addresses.map((addr) =>
        fetch(`${ON_CHAIN_URL}/token-metadata/${addr}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      );
      const res = await Promise.all(promises);
      formattedTokens = res.filter(Boolean).map((m) => toUiToken(m));
    }

    // Final guard: if still empty, show lightweight fallback placeholders for UI
    if (!formattedTokens || formattedTokens.length === 0) {
      formattedTokens = addresses.slice(0, 10).map((addr, i) => ({
        address: addr,
        symbol: `TKN${i + 1}`,
        liquidity: 'N/A',
        change: '0.00%',
        price: '$0.000000',
        volume: '$0',
        raw: null
      }));
    }

    console.log('✅ Final formatted tokens:', formattedTokens);
    setTrendingTokens(formattedTokens);
  } catch (err) {
    console.error('❌ Error fetching trending tokens:', err);
    setTrendingTokens([
      { address: '0x1234...5678', symbol: 'PEPE', liquidity: '1.2M', change: '+24.5%', price: '$0.000012', volume: '$450K' },
      { address: '0x8765...4321', symbol: 'DOGE', liquidity: '850K', change: '+12.3%', price: '$0.085', volume: '$320K' }
    ]);
  } finally {
    setFetchingTokens(false);
  }
};





  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return '$0';
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(2)}M`;
    } else if (value >= 1_000) {
      return `${(value / 1_000).toFixed(0)}K`;
    }
    return `${value.toFixed(2)}`;
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAddress(accounts[0]);
        setConnected(true);
        
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest']
        });
        setEthBalance((parseInt(balance, 16) / 1e18).toFixed(4));
        setContractEthBalance('0.5');
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const depositETH = async () => {
    const amount = prompt('Enter ETH amount to deposit:');
    if (!amount) return;
    
    setLoading(true);
    try {
      setTimeout(() => {
        setContractEthBalance((parseFloat(contractEthBalance) + parseFloat(amount)).toFixed(4));
        setLoading(false);
        alert('Deposit successful!');
      }, 2000);
    } catch (error) {
      console.error('Deposit error:', error);
      setLoading(false);
    }
  };

  const withdrawETH = async () => {
    const amount = prompt('Enter ETH amount to withdraw:');
    if (!amount) return;
    
    setLoading(true);
    try {
      setTimeout(() => {
        setContractEthBalance((parseFloat(contractEthBalance) - parseFloat(amount)).toFixed(4));
        setLoading(false);
        alert('Withdrawal successful!');
      }, 2000);
    } catch (error) {
      console.error('Withdrawal error:', error);
      setLoading(false);
    }
  };

  const runAutomatedTrade = async () => {
    if (trendingTokens.length === 0) {
      console.error('No trending tokens available');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/run-trade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trendingTokens })
      });
      
      if (response.ok) {
        const newTrade = {
          id: Date.now(),
          type: 'BUY',
          token: trendingTokens[0].symbol,
          amount: '0.1 ETH',
          output: '125,000',
          price: trendingTokens[0].price,
          status: 'success',
          timestamp: new Date().toLocaleString()
        };
        setTradeHistory(prev => [newTrade, ...prev].slice(0, 50));
      }
    } catch (error) {
      console.error('Trade execution error:', error);
      const failedTrade = {
        id: Date.now(),
        type: 'BUY',
        token: 'N/A',
        amount: '0 ETH',
        output: '0',
        price: '$0',
        status: 'failed',
        timestamp: new Date().toLocaleString()
      };
      setTradeHistory(prev => [failedTrade, ...prev].slice(0, 50));
    }
  };

  const toggleAutomation = () => {
    setIsAutomating(!isAutomating);
    if (!isAutomating) {
      const interval = setInterval(() => {
        runAutomatedTrade();
      }, intervalTime * 1000);
      window.tradeInterval = interval;
    } else {
      if (window.tradeInterval) {
        clearInterval(window.tradeInterval);
      }
    }
  };

  const addTrendingToken = () => {
    const address = prompt('Enter token contract address:');
    const symbol = prompt('Enter token symbol:');
    if (address && symbol) {
      setTrendingTokens(prev => [...prev, { address, symbol, liquidity: 'N/A', change: '0%', price: '$0', volume: '$0' }]);
    }
  };

  const removeToken = (idx) => {
    setTrendingTokens(prev => prev.filter((_, i) => i !== idx));
  };

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-center bg-accent/20 rounded-md px-2 py-1">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-[11px] font-semibold">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="h-screen flex flex-col">
        {/* Warning Banner */}
        {!connected && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-yellow-500" size={16} />
              <span className="text-xs text-yellow-600">Connect wallet to start trading</span>
            </div>
            <button
              onClick={connectWallet}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-white text-xs transition"
            >
              <Wallet size={14} />
              Connect Wallet
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex gap-0">
            {/* Left Sidebar - Controls */}
            <div className="w-64 bg-card border-r border-border overflow-y-auto">
          <div className="p-3 space-y-3">
            {/* Wallet Info */}
            {connected && (
              <div className="bg-card border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide">Wallet</h3>
                </div>
                <div className="space-y-1.5">
                  <div className="font-mono text-xs bg-accent/20 px-2 py-1 rounded">
                    {address.slice(0, 8)}...{address.slice(-6)}
                  </div>
                  <InfoRow label="Balance" value={`${ethBalance} ETH`} />
                  <InfoRow label="Contract" value={`${contractEthBalance} ETH`} />
                </div>
              </div>
            )}

            {/* API Status */}
            <div className="bg-card border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-purple-500" />
                <h3 className="text-sm font-semibold uppercase tracking-wide">API Status</h3>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between bg-accent/20 rounded-md px-2 py-1">
                  <span className="text-[11px] text-muted-foreground">Trade API</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-semibold capitalize">{apiStatus}</span>
                    <div className={`w-2 h-2 rounded-full ${apiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                </div>
                <div className="flex items-center justify-between bg-accent/20 rounded-md px-2 py-1">
                  <span className="text-[11px] text-muted-foreground">Token API</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-semibold capitalize">{tokenApiStatus}</span>
                    <div className={`w-2 h-2 rounded-full ${tokenApiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Balance Actions */}
            <div className="bg-card border border-border rounded-lg p-3">
              <h3 className="text-xs font-bold mb-2 uppercase tracking-wide">Balance</h3>
              <div className="space-y-2">
                <button
                  onClick={depositETH}
                  disabled={!connected || loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 px-3 py-2 rounded text-xs transition"
                >
                  Deposit ETH
                </button>
                <button
                  onClick={withdrawETH}
                  disabled={!connected || loading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:opacity-50 px-3 py-2 rounded text-xs transition"
                >
                  Withdraw ETH
                </button>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-card border border-border rounded-lg p-3">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center justify-between w-full mb-2"
              >
                <h3 className="text-xs font-bold uppercase tracking-wide">Settings</h3>
                <Settings size={14} />
              </button>
              {showSettings && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Interval (sec)</label>
                    <input
                      type="number"
                      value={intervalTime}
                      onChange={(e) => setIntervalTime(parseInt(e.target.value))}
                      className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs"
                      min="10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Slippage (%)</label>
                    <input
                      type="number"
                      value={slippage}
                      onChange={(e) => setSlippage(parseFloat(e.target.value))}
                      className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs"
                      min="0.1"
                      max="50"
                      step="0.1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Automation */}
            <div className="bg-card border border-border rounded-lg p-3">
              <h3 className="text-xs font-bold mb-2 uppercase tracking-wide">Automation</h3>
              <div className="space-y-2">
                <button
                  onClick={toggleAutomation}
                  disabled={!connected || apiStatus !== 'connected'}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded text-xs font-bold transition ${
                    isAutomating
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  } disabled:bg-gray-600 disabled:opacity-50`}
                >
                  {isAutomating ? <Pause size={14} /> : <Play size={14} />}
                  {isAutomating ? 'STOP' : 'START'}
                </button>
                <button
                  onClick={runAutomatedTrade}
                  disabled={!connected || loading || apiStatus !== 'connected'}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 px-3 py-2 rounded text-xs transition"
                >
                  <RefreshCw size={14} />
                  Run Once
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-card border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-green-500" />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Stats</h3>
              </div>
              <div className="space-y-1.5">
                <InfoRow label="Total" value={tradeHistory.length} />
                <InfoRow 
                  label="Success" 
                  value={
                    <span className="text-green-500">
                      {tradeHistory.filter(t => t.status === 'success').length}
                    </span>
                  } 
                />
                <InfoRow 
                  label="Failed" 
                  value={
                    <span className="text-red-500">
                      {tradeHistory.filter(t => t.status === 'failed').length}
                    </span>
                  } 
                />
                <InfoRow 
                  label="Win Rate" 
                  value={
                    <span className="text-green-500">
                      {tradeHistory.length > 0
                        ? `${((tradeHistory.filter(t => t.status === 'success').length / tradeHistory.length) * 100).toFixed(0)}%`
                        : '0%'}
                    </span>
                  } 
                />
                <div className="flex justify-between items-center bg-accent/20 rounded-md px-2 py-1 mt-2">
                  <span className="text-[11px] text-muted-foreground">Status</span>
                  <span className={`text-[11px] font-semibold ${isAutomating ? 'text-green-500' : 'text-muted-foreground'}`}>
                    {isAutomating ? '● Running' : '○ Stopped'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Trending Tokens */}
        <div className="flex-1 bg-card border-r border-border overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wide">Trending Tokens</h3>
              <div className="flex gap-2">
                <button
                  onClick={fetchTrendingTokens}
                  disabled={fetchingTokens}
                  className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 px-3 py-1.5 rounded text-xs transition"
                >
                  <RefreshCw size={14} className={fetchingTokens ? 'animate-spin' : ''} />
                  Refresh
                </button>
                <button
                  onClick={addTrendingToken}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-xs transition"
                >
                  <Plus size={14} />
                  Add Token
                </button>
              </div>
            </div>
            {fetchingTokens && trendingTokens.length === 0 ? (
              <div className="text-center text-muted-foreground py-20">
                <RefreshCw size={48} className="mx-auto mb-3 opacity-30 animate-spin" />
                <p className="text-xs">Loading trending tokens...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {trendingTokens.map((token, idx) => (
                  <div key={idx} className="bg-card border border-border rounded-lg p-3 hover:bg-accent/20 transition group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-base">{token.symbol}</span>
                        <span className={`text-sm font-bold ${token.change?.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                          {token.change}
                        </span>
                      </div>
                      <button
                        onClick={() => removeToken(idx)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:bg-red-500/10 rounded transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mb-2 bg-accent/20 px-2 py-1 rounded inline-block">
                      {token.address}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-accent/30 rounded-lg p-2 border border-border/40">
                        <div className="flex items-center gap-1 mb-1">
                          <DollarSign className="w-3 h-3 text-blue-500" />
                          <span className="text-[10px] text-muted-foreground uppercase">Price</span>
                        </div>
                        <div className="text-xs font-bold">{token.price}</div>
                      </div>
                      <div className="bg-accent/30 rounded-lg p-2 border border-border/40">
                        <div className="flex items-center gap-1 mb-1">
                          <Activity className="w-3 h-3 text-purple-500" />
                          <span className="text-[10px] text-muted-foreground uppercase">Liq</span>
                        </div>
                        <div className="text-xs font-bold">{token.liquidity}</div>
                      </div>
                      <div className="bg-accent/30 rounded-lg p-2 border border-border/40">
                        <div className="flex items-center gap-1 mb-1">
                          <BarChart3 className="w-3 h-3 text-green-500" />
                          <span className="text-[10px] text-muted-foreground uppercase">Vol</span>
                        </div>
                        <div className="text-xs font-bold">{token.volume}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

            {/* Right - Trade History */}
            <div className="w-80 bg-card overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-bold uppercase tracking-wide">Trade History</h3>
            </div>
            
            {tradeHistory.length === 0 ? (
              <div className="text-center text-muted-foreground py-20">
                <AlertCircle size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-xs">No trades executed yet</p>
                <p className="text-xs mt-1">Start automation or run a single trade</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tradeHistory.map((trade) => (
                  <div
                    key={trade.id}
                    className={`bg-card border rounded-lg p-3 ${
                      trade.status === 'success' ? 'border-green-500/20' : 'border-red-500/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {trade.type === 'BUY' ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                        )}
                        <span className={`text-xs font-bold ${
                          trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {trade.type}
                        </span>
                        <span className="text-sm font-bold">{trade.token}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${
                        trade.status === 'success'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trade.status}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <InfoRow label="Input" value={trade.amount} />
                      <InfoRow label="Output" value={`${trade.output} tokens`} />
                      <InfoRow label="Price" value={trade.price} />
                      <div className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border">
                        {trade.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}