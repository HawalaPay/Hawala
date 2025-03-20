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
    lethereum?: Ethereum;
  }
}

const TOKENS = [
  {
    address: "0x54dbf636810118e623ae9770ac3b0ddbdcffe1e7",
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

export interface StatData {
  label: string;
  amount: string;
  symbol: string;
  trend?: number;
  error?: string;
}

export interface StatsGridProps {
  stats?: StatData[];
  autoConnect?: boolean;
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

const StatsGrid: React.FC<StatsGridProps> = ({ stats: externalStats, autoConnect = true }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [internalStats, setInternalStats] = useState<StatData[]>([]);
  const [account, setAccount] = useState<string | null>(null);
  const [providerError, setProviderError] = useState<string | null>(null);
  
  // Determine if we're using external stats
  const usingExternalStats = Array.isArray(externalStats) && externalStats.length > 0;

  const handleAccountsChanged = async (accounts: unknown) => {
    if (Array.isArray(accounts) && accounts.length > 0) {
      const [firstAccount] = accounts as string[];
      setAccount(firstAccount);
      setIsConnected(true);
      await fetchBalances(firstAccount);
    } else {
      setAccount(null);
      setIsConnected(false);
      setInternalStats(TOKENS.map(token => ({
        label: token.label,
        amount: token.defaultValue,
        symbol: token.symbol,
      })));
    }
  };

  const checkAndConnectWallet = async () => {
    setIsLoading(true);
    setProviderError(null);
    
    try {
      if (!window.ethereum) {
        setProviderError("No Ethereum provider detected. Please install MetaMask.");
        setIsLoading(false);
        return;
      }

      // First check if already connected
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts && Array.isArray(accounts) && accounts.length > 0) {
        // Already connected
        await handleAccountsChanged(accounts);
      } else if (autoConnect) {
        // Not connected but autoConnect is true, so request connection
        const requestedAccounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        await handleAccountsChanged(requestedAccounts);
      } else {
        // Not connected and autoConnect is false
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      if (error instanceof Error) {
        setProviderError(`Connection error: ${error.message}`);
      } else {
        setProviderError("Failed to connect to wallet");
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Skip if using external stats
    if (!usingExternalStats) {
      checkAndConnectWallet();

      // Set up event listeners
      if (window.ethereum) {
        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("chainChanged", () => {
          // Refresh the page on chain change
          window.location.reload();
        });

        return () => {
          window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum?.removeListener("chainChanged", () => {});
        };
      }
    } else {
      setIsLoading(false);
    }
  }, [usingExternalStats, autoConnect]);

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
      setInternalStats(balances);
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      setInternalStats(TOKENS.map(token => ({
        label: token.label,
        amount: token.defaultValue,
        symbol: token.symbol,
        error: "Failed to fetch balance",
      })));
    } finally {
      setIsLoading(false);
    }
  };

  // Manual connect function for when autoConnect is false
  const connectWallet = async () => {
    await checkAndConnectWallet();
  };

  // If external stats are provided, use them directly
  if (usingExternalStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {externalStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>
    );
  }

  // Show provider error if exists
  if (providerError) {
    return (
      <div className="text-center p-4 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-red-600 mb-4">{providerError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Show connect button if not connected and autoConnect is false
  if (!isConnected && !autoConnect) {
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

  // Show loading state while connecting or fetching balances
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LoadingSkeleton />
        <LoadingSkeleton />
      </div>
    );
  }

  // Show balances
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {internalStats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default StatsGrid;