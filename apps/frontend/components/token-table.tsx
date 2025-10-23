"use client";
import { TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

interface Token {
  rank: number;
  name: string;
  symbol: string;
  price: number;
  age: string;
  txns: number;
  volume: string;
  makers: number;
  change5m: number;
  change1h: number;
  change6h: number;
  change24h: number;
  liquidity: string;
  mcap: string;
  icon: string;
  tokenAddress: string;
}

const mockTokens: Token[] = [
  {
    rank: 1,
    name: "trust me bro",
    symbol: "TMB",
    price: 0.001799,
    age: "7h",
    txns: 45506,
    volume: "$15.5M",
    makers: 9044,
    change5m: -5.37,
    change1h: -7.6,
    change6h: -14.35,
    change24h: 467,
    liquidity: "$316K",
    mcap: "$1.7M",
    icon: "😊",
    tokenAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  },
  {
    rank: 2,
    name: "Bullseus Maximus",
    symbol: "BULL",
    price: 0.001059,
    age: "22h",
    txns: 30677,
    volume: "$2.8M",
    makers: 8046,
    change5m: 9.78,
    change1h: 34.1,
    change6h: 43.73,
    change24h: 1135,
    liquidity: "$128K",
    mcap: "$1.0M",
    icon: "📈",
    tokenAddress: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
  },
  {
    rank: 3,
    name: "Meteora",
    symbol: "MET",
    price: 0.6146,
    age: "1d",
    txns: 11036,
    volume: "$22.7M",
    makers: 4936,
    change5m: 1.21,
    change1h: 0.28,
    change6h: 22.18,
    change24h: 22.18,
    liquidity: "$36.6M",
    mcap: "$295.0M",
    icon: "🌙",
    tokenAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  },
  {
    rank: 4,
    name: "CINEMA",
    symbol: "CINE",
    price: 0.0003239,
    age: "6h",
    txns: 11339,
    volume: "$789K",
    makers: 2777,
    change5m: -16.55,
    change1h: 44.31,
    change6h: 233,
    change24h: 322,
    liquidity: "$67K",
    mcap: "$323K",
    icon: "🎬",
    tokenAddress: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
  },
  {
    rank: 5,
    name: "Money Sharks",
    symbol: "SHARK",
    price: 0.003116,
    age: "1d",
    txns: 49198,
    volume: "$19.5M",
    makers: 8733,
    change5m: -1.84,
    change1h: -7.26,
    change6h: -52.92,
    change24h: -47.0,
    liquidity: "$297K",
    mcap: "$3.1M",
    icon: "🦈",
    tokenAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
  },
  {
    rank: 6,
    name: "Pepe Unchained",
    symbol: "PEPU",
    price: 0.004521,
    age: "9h",
    txns: 38492,
    volume: "$11.2M",
    makers: 7234,
    change5m: 12.34,
    change1h: 23.45,
    change6h: 78.92,
    change24h: 234,
    liquidity: "$543K",
    mcap: "$4.5M",
    icon: "🐸",
    tokenAddress: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
  },
  {
    rank: 7,
    name: "Diamond Protocol",
    symbol: "DIAM",
    price: 0.008934,
    age: "2d",
    txns: 23456,
    volume: "$7.8M",
    makers: 5432,
    change5m: -3.21,
    change1h: 8.76,
    change6h: 34.56,
    change24h: 123,
    liquidity: "$892K",
    mcap: "$8.9M",
    icon: "💎",
    tokenAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  },
  {
    rank: 8,
    name: "Rocket Moon",
    symbol: "RMOON",
    price: 0.000234,
    age: "4h",
    txns: 56789,
    volume: "$23.4M",
    makers: 11234,
    change5m: 45.67,
    change1h: 89.12,
    change6h: 234.56,
    change24h: 678,
    liquidity: "$234K",
    mcap: "$2.3M",
    icon: "🚀",
    tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
  {
    rank: 9,
    name: "Shiba Warrior",
    symbol: "SHIBW",
    price: 0.000567,
    age: "18h",
    txns: 42345,
    volume: "$9.8M",
    makers: 8765,
    change5m: -8.92,
    change1h: -12.34,
    change6h: -23.45,
    change24h: 89,
    liquidity: "$456K",
    mcap: "$5.6M",
    icon: "🐕",
    tokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
  {
    rank: 10,
    name: "Doge Killer",
    symbol: "LEASH",
    price: 0.012345,
    age: "3d",
    txns: 19876,
    volume: "$5.6M",
    makers: 4321,
    change5m: 3.45,
    change1h: 6.78,
    change6h: 12.34,
    change24h: 45,
    liquidity: "$1.2M",
    mcap: "$12.3M",
    icon: "🔥",
    tokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  },
  {
    rank: 11,
    name: "SafeMoon V2",
    symbol: "SFM",
    price: 0.000089,
    age: "12h",
    txns: 67543,
    volume: "$18.9M",
    makers: 13456,
    change5m: -15.67,
    change1h: -34.56,
    change6h: -67.89,
    change24h: -23,
    liquidity: "$289K",
    mcap: "$890K",
    icon: "🌙",
    tokenAddress: "0xC01318baB7ee1f5ba734172bF7718b5DC6Ec90E1",
  },
  {
    rank: 12,
    name: "Elon's Cat",
    symbol: "ECAT",
    price: 0.003456,
    age: "5h",
    txns: 34567,
    volume: "$13.4M",
    makers: 9876,
    change5m: 67.89,
    change1h: 123.45,
    change6h: 345.67,
    change24h: 890,
    liquidity: "$345K",
    mcap: "$3.4M",
    icon: "🐱",
    tokenAddress: "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
  },
  {
    rank: 13,
    name: "Baby Doge",
    symbol: "BABYDOGE",
    price: 0.000000234,
    age: "15h",
    txns: 89012,
    volume: "$34.5M",
    makers: 18901,
    change5m: 12.34,
    change1h: 34.56,
    change6h: 89.12,
    change24h: 234,
    liquidity: "$567K",
    mcap: "$23.4M",
    icon: "👶",
    tokenAddress: "0x8E870D67F660D95d5be530380D0eC0bd388289E1",
  },
  {
    rank: 14,
    name: "Floki Viking",
    symbol: "FLOKI",
    price: 0.00234,
    age: "8h",
    txns: 45678,
    volume: "$16.7M",
    makers: 10234,
    change5m: -7.89,
    change1h: 15.67,
    change6h: 45.23,
    change24h: 156,
    liquidity: "$678K",
    mcap: "$16.7M",
    icon: "⚔️",
    tokenAddress: "0x0D8775F648430679A709E98d2b0Cb6250d2887EF",
  },
  {
    rank: 15,
    name: "Akita Inu",
    symbol: "AKITA",
    price: 0.000678,
    age: "11h",
    txns: 28901,
    volume: "$8.9M",
    makers: 6789,
    change5m: 23.45,
    change1h: 45.67,
    change6h: 89.01,
    change24h: 234,
    liquidity: "$234K",
    mcap: "$6.7M",
    icon: "🐕‍🦺",
    tokenAddress: "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
  },
  {
    rank: 16,
    name: "Kishu Token",
    symbol: "KISHU",
    price: 0.00000123,
    age: "19h",
    txns: 52345,
    volume: "$21.2M",
    makers: 12345,
    change5m: -12.34,
    change1h: -23.45,
    change6h: 34.56,
    change24h: 89,
    liquidity: "$432K",
    mcap: "$12.3M",
    icon: "🎌",
    tokenAddress: "0x111111111117dC0aa78b770fA6A738034120C302",
  },
  {
    rank: 17,
    name: "Hoge Finance",
    symbol: "HOGE",
    price: 0.00045,
    age: "2d",
    txns: 34567,
    volume: "$12.3M",
    makers: 7890,
    change5m: 8.91,
    change1h: 12.34,
    change6h: 23.45,
    change24h: 67,
    liquidity: "$567K",
    mcap: "$4.5M",
    icon: "🐷",
    tokenAddress: "0xfAd45E47083e4607302aa43c65fB3106F1cd7607",
  },
  {
    rank: 18,
    name: "Saitama Inu",
    symbol: "SAITAMA",
    price: 0.000234,
    age: "14h",
    txns: 41234,
    volume: "$14.5M",
    makers: 9345,
    change5m: 34.56,
    change1h: 67.89,
    change6h: 123.45,
    change24h: 345,
    liquidity: "$345K",
    mcap: "$23.4M",
    icon: "🥷",
    tokenAddress: "0x3472A5A71965499acd81997a54BBA8D852C6E53d",
  },
  {
    rank: 19,
    name: "Dogelon Mars",
    symbol: "ELON",
    price: 0.00000056,
    age: "1d",
    txns: 67890,
    volume: "$29.8M",
    makers: 15678,
    change5m: -5.67,
    change1h: 8.91,
    change6h: 34.56,
    change24h: 123,
    liquidity: "$789K",
    mcap: "$56.7M",
    icon: "🪐",
    tokenAddress: "0x761D38e5ddf6ccf6Cf7c55759d5210750B5D60F3",
  },
  {
    rank: 20,
    name: "Catecoin",
    symbol: "CATE",
    price: 0.000891,
    age: "6h",
    txns: 29876,
    volume: "$9.8M",
    makers: 6543,
    change5m: 15.67,
    change1h: 34.56,
    change6h: 78.91,
    change24h: 234,
    liquidity: "$321K",
    mcap: "$8.9M",
    icon: "😺",
    tokenAddress: "0x50D1c9771902476076eCFc8B2A83Ad6b9355a4c9",
  },
  {
    rank: 21,
    name: "Samoyedcoin",
    symbol: "SAMO",
    price: 0.00123,
    age: "10h",
    txns: 38901,
    volume: "$17.6M",
    makers: 8901,
    change5m: 23.45,
    change1h: 56.78,
    change6h: 123.45,
    change24h: 456,
    liquidity: "$456K",
    mcap: "$12.3M",
    icon: "🐕‍🦺",
    tokenAddress: "0x853d955aCEf822Db058eb8505911ED77F175b99e",
  },
  {
    rank: 22,
    name: "Jacy Token",
    symbol: "JACY",
    price: 0.00000789,
    age: "21h",
    txns: 45678,
    volume: "$19.4M",
    makers: 10234,
    change5m: -18.91,
    change1h: -34.56,
    change6h: -56.78,
    change24h: -12,
    liquidity: "$234K",
    mcap: "$7.8M",
    icon: "🌸",
    tokenAddress: "0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0",
  },
  {
    rank: 23,
    name: "Hokkaido Inu",
    symbol: "HOKK",
    price: 0.000345,
    age: "16h",
    txns: 34567,
    volume: "$11.2M",
    makers: 7890,
    change5m: 12.34,
    change1h: 23.45,
    change6h: 45.67,
    change24h: 156,
    liquidity: "$345K",
    mcap: "$34.5M",
    icon: "❄️",
    tokenAddress: "0xE5097D9baeAFB89f9bcB78C9290d545dB5f9e9CB",
  },
  {
    rank: 24,
    name: "Luffy Token",
    symbol: "LUFFY",
    price: 0.00000234,
    age: "7h",
    txns: 56789,
    volume: "$24.5M",
    makers: 13456,
    change5m: 45.67,
    change1h: 89.12,
    change6h: 234.56,
    change24h: 678,
    liquidity: "$567K",
    mcap: "$23.4M",
    icon: "👒",
    tokenAddress: "0x7859B01BbF675d67Da8cD128a50D155cd881B576",
  },
  {
    rank: 25,
    name: "Mononoke Inu",
    symbol: "MONONOKE",
    price: 0.00000678,
    age: "13h",
    txns: 41234,
    volume: "$16.7M",
    makers: 9876,
    change5m: -23.45,
    change1h: -45.67,
    change6h: -89.12,
    change24h: -34,
    liquidity: "$289K",
    mcap: "$6.7M",
    icon: "👹",
    tokenAddress: "0xf4d2888d29D722226FafA5d9B24F9164c092421E",
  },
];
interface TokenTableProps {
  timeframe: string;
  sortBy: string;
  filterType: string;
}

export default function TokenTable({
  timeframe,
  sortBy,
  filterType,
}: TokenTableProps) {
  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-500";
    if (change < 0) return "text-red-500";
    return "text-muted-foreground";
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3 inline mr-1" />;
    if (change < 0) return <TrendingDown className="w-3 h-3 inline mr-1" />;
    return null;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-card/50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              TOKEN
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              PRICE
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              AGE
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              TXNS
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              VOLUME
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              MAKERS
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              5M
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              1H
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              6H
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              24H
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              LIQUIDITY
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              MCAP
            </th>
          </tr>
        </thead>
        <tbody>
          {mockTokens.map((token) => (
            <tr
              key={token.rank}
              className="border-b border-border hover:bg-card/50 transition-colors cursor-pointer"
            >
              <td className="px-4 py-3">
                <Link href={`/token/${token.tokenAddress}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-semibold">
                      #{token.rank}
                    </span>
                    <span className="text-lg">{token.icon}</span>
                    <div>
                      <p className="font-semibold text-foreground">
                        {token.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {token.symbol}
                      </p>
                    </div>
                  </div>
                </Link>
              </td>
              <td className="px-4 py-3 text-foreground font-mono">
                ${token.price.toFixed(6)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{token.age}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {token.txns.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {token.volume}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {token.makers.toLocaleString()}
              </td>
              <td
                className={`px-4 py-3 font-semibold ${getChangeColor(token.change5m)}`}
              >
                {getChangeIcon(token.change5m)}
                {token.change5m > 0 ? "+" : ""}
                {token.change5m.toFixed(2)}%
              </td>
              <td
                className={`px-4 py-3 font-semibold ${getChangeColor(token.change1h)}`}
              >
                {getChangeIcon(token.change1h)}
                {token.change1h > 0 ? "+" : ""}
                {token.change1h.toFixed(2)}%
              </td>
              <td
                className={`px-4 py-3 font-semibold ${getChangeColor(token.change6h)}`}
              >
                {getChangeIcon(token.change6h)}
                {token.change6h > 0 ? "+" : ""}
                {token.change6h.toFixed(2)}%
              </td>
              <td
                className={`px-4 py-3 font-semibold ${getChangeColor(token.change24h)}`}
              >
                {getChangeIcon(token.change24h)}
                {token.change24h > 0 ? "+" : ""}
                {token.change24h.toFixed(2)}%
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {token.liquidity}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{token.mcap}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
