"use client";

import { MetaMaskInpageProvider } from "@metamask/providers";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface PricePoint {
  time: number;
  price: number;
}

interface CryptoData {
  id: number;
  name: string;
  symbol: string;
  price: number;
  change: number;
  priceHistory: PricePoint[];
}

// Modify the window declaration to correctly match the MetaMaskInpageProvider
declare global {
  interface Window {
    gethereum?: MetaMaskInpageProvider;
  }
}

const generateVolatileData = (basePrice: number): PricePoint[] => {
  return Array.from({ length: 20 }, (_, i) => ({
    time: i,
    price: basePrice * (1 + (Math.random() * 0.4 - 0.2))
  }));
};

const CompactCrypto = () => {
  const [cryptos, setCryptos] = useState<CryptoData[]>([
    {
      id: 1,
      name: "Bitcoin",
      symbol: "BTC",
      price: 4380000,
      change: 2.4,
      priceHistory: generateVolatileData(4380000)
    },
    {
      id: 2,
      name: "Ethereum",
      symbol: "ETH",
      price: 230000,
      change: -1.8,
      priceHistory: generateVolatileData(230000)
    },
    {
      id: 3,
      name: "Solana",
      symbol: "SOL",
      price: 12000,
      change: 3.2,
      priceHistory: generateVolatileData(12000)
    },
    {
      id: 4,
      name: "Ripple",
      symbol: "XRP",
      price: 75,
      change: 1.6,
      priceHistory: generateVolatileData(75)
    },
    {
      id: 5,
      name: "Cardano",
      symbol: "ADA",
      price: 150,
      change: 0.9,
      priceHistory: generateVolatileData(150)
    },
    {
      id: 7,
      name: "Litecoin",
      symbol: "LTC",
      price: 11000,
      change: 4.5,
      priceHistory: generateVolatileData(11000)
    },
    {
      id: 8,
      name: "Chainlink",
      symbol: "LINK",
      price: 1200,
      change: -2.2,
      priceHistory: generateVolatileData(1200)
    },
    {
      id: 9,
      name: "Uniswap",
      symbol: "UNI",
      price: 3500,
      change: 5.7,
      priceHistory: generateVolatileData(3500)
    },
    {
      id: 10,
      name: "Dogecoin",
      symbol: "DOGE",
      price: 6.5,
      change: 3.1,
      priceHistory: generateVolatileData(6.5)
    },
    {
      id: 11,
      name: "Avalanche",
      symbol: "AVAX",
      price: 3500,
      change: -0.7,
      priceHistory: generateVolatileData(3500)
    },
    {
      id: 12,
      name: "Shiba Inu",
      symbol: "SHIB",
      price: 0.00005,
      change: 7.3,
      priceHistory: generateVolatileData(0.00005)
    },
    {
      id: 13,
      name: "Polygon",
      symbol: "MATIC",
      price: 250,
      change: 0.4,
      priceHistory: generateVolatileData(250)
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCryptos(prev => prev.map(crypto => {
        const volatility = Math.random() * 0.06 - 0.03;
        const newPrice = crypto.price * (1 + volatility);
        return {
          ...crypto,
          price: newPrice,
          change: crypto.change + (Math.random() * 0.8 - 0.4),
          priceHistory: [...crypto.priceHistory.slice(1), {
            time: crypto.priceHistory[crypto.priceHistory.length - 1].time + 1,
            price: newPrice
          }]
        };
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const connectToMetaMask = async (crypto: CryptoData) => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to proceed.");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Ensure accounts is not null or undefined
      const accounts: string[] = await window.ethereum.request({ method: "eth_accounts" }) as string[];

      if (accounts && accounts.length > 0) {
        alert(`You are about to buy ${crypto.name}. Transaction details will appear here.`);
        const transactionParams = {
          to: "0xYourContractAddressHere", // Replace with actual contract address
          from: accounts[0],
          value: (crypto.price * 1e9).toString(16),
          gas: "21000"
        };

        await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [transactionParams]
        });
      } else {
        alert("No MetaMask accounts found.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while connecting to MetaMask.");
    }
  };

  const totalMarketValue = cryptos.reduce((acc, crypto) => acc + crypto.price, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4">
        {/* Header Section */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold text-gray-900">Cryptocurrency Market</h1>
          <p className="text-gray-500 mt-1 text-sm">Stay updated with real-time prices and market trends</p>
        </div>

        {/* Market Overview */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Market Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="text-gray-500">Total Market Value</p>
              <p className="text-xl font-bold">₹{totalMarketValue.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Active Markets</p>
              <p className="text-xl font-bold">{cryptos.length}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Update Frequency</p>
              <p className="text-xl font-bold">2s</p>
            </div>
          </div>
        </div>

        {/* Live Prices */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Live Prices</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {cryptos.map(crypto => (
              <Card key={crypto.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-1">
                        <h3 className="text-base font-medium">{crypto.name}</h3>
                        <span className="text-xs text-gray-500">{crypto.symbol}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-base font-semibold">
                          ₹{crypto.price.toLocaleString()}
                        </span>
                        <div className="flex items-center">
                          {crypto.change >= 0 ? (
                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`text-xs ${crypto.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {Math.abs(crypto.change).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-20 h-12">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={crypto.priceHistory}>
                          <Line 
                            type="monotone" 
                            dataKey="price" 
                            stroke={crypto.change >= 0 ? "#22c55e" : "#ef4444"}
                            strokeWidth={1.5}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <button
                    onClick={() => connectToMetaMask(crypto)}
                    className="mt-3 w-full px-3 py-2 bg-black text-white text-sm rounded hover:bg-gray-800"
                  >
                    Buy {crypto.name}
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>Data updates every 2 seconds. All prices are in Indian Rupees (₹).</p>
        </div>
      </div>
    </div>
  );
};

export default CompactCrypto;
