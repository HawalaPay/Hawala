import React, { useEffect, useState } from "react";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Ethereum {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (eventName: string, handler: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    kethereum?: Ethereum;
  }
}

const TOKENS = [
  {
    address: "0xfD4eCAfDFd435cd23E90Da010E3E8b4e791A3D21",
    label: "RUPA Balance",
    symbol: "RUPA",
    defaultValue: "0.00",
  },
  {
    address: "0x0000000000000000000000000000000000001010",
    label: "Amoy Pol Balance",
    symbol: "AMOY",
    defaultValue: "0.00",
  },
];

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

interface StatData {
  label: string;
  amount: string;
  symbol: string;
  trend?: number;
  error?: string;
}

const StatsCard = ({ label, amount, symbol, trend = 0, error }: StatData) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        {error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : (
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-bold">{amount}</h3>
            <span className="text-lg text-gray-600">{symbol}</span>
          </div>
        )}
      </div>
      {!error && trend !== 0 && (
        <div
          className={`flex items-center ${
            trend > 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="text-sm ml-1">{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="w-full">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  </div>
);

export default function StatsGrid() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<StatData[]>(
    TOKENS.map((token) => ({
      label: token.label,
      amount: token.defaultValue,
      symbol: token.symbol,
      trend: 0,
    }))
  );
  const [account, setAccount] = useState<string | null>(null);

  const handleAccountsChanged = (accounts: unknown) => {
    // Type narrowing for `accounts`
    if (Array.isArray(accounts) && accounts.length > 0) {
      const [firstAccount] = accounts as string[];
      setAccount(firstAccount);
      setIsConnected(true);
      fetchBalances(firstAccount);
    } else {
      setAccount(null);
      setIsConnected(false);
      resetStats();
    }
  };

  const resetStats = () => {
    setStats(
      TOKENS.map((token) => ({
        label: token.label,
        amount: token.defaultValue,
        symbol: token.symbol,
        trend: 0,
      }))
    );
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, []);

  const fetchBalances = async (userAccount: string) => {
    setIsLoading(true);
    try {
      if (!window.ethereum) throw new Error("No provider available");

      const provider = new BrowserProvider(window.ethereum);
      const balances = await Promise.all(
        TOKENS.map(async (token) => {
          try {
            const contract = new Contract(token.address, ERC20_ABI, provider);
            const [balance, decimals] = await Promise.all([
              contract.balanceOf(userAccount),
              contract.decimals(),
            ]);
            const formattedBalance = parseFloat(formatUnits(balance, decimals));
            return {
              label: token.label,
              amount: formattedBalance.toFixed(2),
              symbol: token.symbol,
              trend: 0,
            };
          } catch (error) {
            return {
              label: token.label,
              amount: token.defaultValue,
              symbol: token.symbol,
              error: "Failed to fetch balance",
            };
          }
        })
      );
      setStats(balances);
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      resetStats();
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    setIsLoading(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && Array.isArray(accounts)) {
        handleAccountsChanged(accounts);
      }
    } catch (error) {
      console.error("Failed to connect:", error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center">
        <button
          type="button"
          onClick={connectWallet}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer font-medium text-base"
        >
          Connect MetaMask
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LoadingSkeleton />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
