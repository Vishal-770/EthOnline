"use client";

import { useState } from "react";

interface Transfer {
  blockNumber: number;
  timestamp: number;
  transactionHash: string;
  logIndex: number;
  from: string;
  to: string;
  amount: string;
  amountFormatted: string;
}

interface ERC20Response {
  success: boolean;
  data?: {
    tokenAddress: string;
    decimals: number;
    totalVolume: string;
    totalBlocks: number;
    totalTransfers: number;
    validTransfers: number;
    nextBlock: number;
    archiveHeight: number;
    transfers: Transfer[];
  };
  message?: string;
  error?: string;
  availableTokens?: string[];
}

const PRESET_TOKENS = ["USDC", "USDT", "DAI", "WETH", "LINK", "AAVE"];
const TIME_RANGES = [
  { label: "Last 1 minute", value: "1m" },
  { label: "Last 10 minutes", value: "10m" },
  { label: "Last 1 hour", value: "1h" },
  { label: "Last 1 day", value: "1d" },
  { label: "All time", value: "all" },
];

export default function ERC20Dashboard() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ERC20Response | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("USDC");
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [customTokenAddress, setCustomTokenAddress] = useState("");
  const [customDecimals, setCustomDecimals] = useState("18");
  const [timeRange, setTimeRange] = useState("all");
  const [fromBlock, setFromBlock] = useState("0");
  const [toBlock, setToBlock] = useState("");

  const handleQuery = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (useCustomAddress) {
        if (!customTokenAddress) {
          setError("Please enter a token address");
          setLoading(false);
          return;
        }
        params.append("tokenAddress", customTokenAddress);
        params.append("decimals", customDecimals);
      } else {
        params.append("token", tokenInput);
      }

      params.append("timeRange", timeRange);

      if (fromBlock !== "0") {
        params.append("fromBlock", fromBlock);
      }
      if (toBlock) {
        params.append("toBlock", toBlock);
      }

      const res = await fetch(`/api/erc20?${params.toString()}`);
      const data: ERC20Response = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch data");
      } else {
        setResponse(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            ERC20 Transfer Tracker
          </h1>
          <p className="text-slate-400">
            Track and analyze ERC20 token transfers across Ethereum
          </p>
        </div>

        {/* Query Section */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-6">
            Query Configuration
          </h2>

          {/* Token Selection */}
          <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Token</h3>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!useCustomAddress}
                  onChange={() => setUseCustomAddress(false)}
                  className="w-4 h-4"
                />
                <span className="text-white">Preset Token</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={useCustomAddress}
                  onChange={() => setUseCustomAddress(true)}
                  className="w-4 h-4"
                />
                <span className="text-white">Custom Token Address</span>
              </label>
            </div>

            {!useCustomAddress ? (
              <div>
                <select
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {PRESET_TOKENS.map((token) => (
                    <option key={token} value={token}>
                      {token}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Token Address (0x...)
                  </label>
                  <input
                    type="text"
                    value={customTokenAddress}
                    onChange={(e) => setCustomTokenAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Decimals
                  </label>
                  <input
                    type="number"
                    value={customDecimals}
                    onChange={(e) => setCustomDecimals(e.target.value)}
                    min="0"
                    max="18"
                    className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Time Range Selection */}
          <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">
              Time Range
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {TIME_RANGES.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    timeRange === range.value
                      ? "bg-blue-600 text-white"
                      : "bg-slate-600 text-slate-300 hover:bg-slate-500"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Block Range */}
          <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">
              Custom Block Range (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  From Block
                </label>
                <input
                  type="number"
                  value={fromBlock}
                  onChange={(e) => setFromBlock(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  To Block (Optional)
                </label>
                <input
                  type="number"
                  value={toBlock}
                  onChange={(e) => setToBlock(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Latest"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleQuery}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? "Loading..." : "Query Transfers"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-8 text-red-200">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Results Section */}
        {response && response.success && response.data && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <p className="text-slate-400 text-sm font-medium mb-1">
                  Total Volume
                </p>
                <p className="text-2xl font-bold text-white truncate">
                  {response.data.totalVolume === "0"
                    ? "0"
                    : (
                        Number(response.data.totalVolume) /
                        Math.pow(10, response.data.decimals)
                      ).toFixed(2)}
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <p className="text-slate-400 text-sm font-medium mb-1">
                  Total Transfers
                </p>
                <p className="text-2xl font-bold text-white">
                  {response.data.totalTransfers.toLocaleString()}
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <p className="text-slate-400 text-sm font-medium mb-1">
                  Blocks Queried
                </p>
                <p className="text-2xl font-bold text-white">
                  {response.data.totalBlocks.toLocaleString()}
                </p>
              </div>
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <p className="text-slate-400 text-sm font-medium mb-1">
                  Valid Transfers
                </p>
                <p className="text-2xl font-bold text-white">
                  {response.data.validTransfers.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Token Info */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                Token Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Token Address</p>
                  <p className="text-white font-mono text-xs break-all">
                    {response.data.tokenAddress}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Decimals</p>
                  <p className="text-white font-mono">
                    {response.data.decimals}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Archive Height</p>
                  <p className="text-white font-mono">
                    {response.data.archiveHeight.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Query Result</p>
                  <p className="text-white text-sm wrap-break-word">
                    {response.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Transfers Table */}
            {response.data.transfers.length > 0 && (
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 overflow-x-auto">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Recent Transfers (Sample - First 50)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                          Block
                        </th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                          Tx
                        </th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                          From
                        </th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                          To
                        </th>
                        <th className="text-right py-3 px-4 text-slate-300 font-semibold">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {response.data.transfers
                        .slice(0, 50)
                        .map((transfer, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-slate-700 hover:bg-slate-700/50"
                          >
                            <td className="py-3 px-4 text-slate-300">
                              {transfer.blockNumber}
                            </td>
                            <td className="py-3 px-4 text-blue-400 font-mono text-xs truncate max-w-xs">
                              <a
                                href={`https://etherscan.io/tx/${transfer.transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-300"
                              >
                                {transfer.transactionHash.slice(0, 8)}...
                              </a>
                            </td>
                            <td className="py-3 px-4 text-blue-400 font-mono text-xs truncate max-w-xs">
                              <a
                                href={`https://etherscan.io/address/${transfer.from}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-300"
                              >
                                {transfer.from.slice(0, 8)}...
                              </a>
                            </td>
                            <td className="py-3 px-4 text-blue-400 font-mono text-xs truncate max-w-xs">
                              <a
                                href={`https://etherscan.io/address/${transfer.to}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-300"
                              >
                                {transfer.to.slice(0, 8)}...
                              </a>
                            </td>
                            <td className="py-3 px-4 text-slate-300 text-right font-mono">
                              {transfer.amountFormatted}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {response.data.transfers.length > 50 && (
                  <p className="text-slate-400 text-sm mt-4">
                    Showing 50 of {response.data.transfers.length} transfers
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!response && !loading && (
          <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
            <p className="text-slate-400">
              Configure a token and click "Query Transfers" to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
