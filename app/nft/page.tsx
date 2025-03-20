"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UIButton } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2, Wallet } from "lucide-react";
import { ethers, BrowserProvider, Contract, formatUnits } from "ethers";

interface NFT {
  id: number;
  name: string;
  price: number;
  image: string;
}

const TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

const TOKEN_ADDRESS = "0xfD4eCAfDFd435cd23E90Da010E3E8b4e791A3D21";

const NFTMarketplace = () => {
  const [nfts] = useState<NFT[]>([
    {
      id: 1,
      name: "Digital Dream #1",
      price: 0.05,
      image: "https://github.com/omsandippatil/Hawala/blob/main/img/nft/1.jpg?raw=true"
    },
    {
      id: 2,
      name: "Cosmic Art #4",
      price: 0.12,
      image: "https://github.com/omsandippatil/Hawala/blob/main/img/nft/2.jpg?raw=true"
    },
    {
      id: 3,
      name: "Future Vision #7",
      price: 0.08,
      image: "https://github.com/omsandippatil/Hawala/blob/main/img/nft/3.jpg?raw=true"
    },
    {
      id: 4,
      name: "Digital Beast #2",
      price: 0.15,
      image: "https://github.com/omsandippatil/Hawala/blob/main/img/nft/4.jpg?raw=true"
    },
    {
      id: 5,
      name: "Cyber Punk #3",
      price: 0.18,
      image: "https://github.com/omsandippatil/Hawala/blob/main/img/nft/5.jpg?raw=true"
    },
    {
      id: 6,
      name: "Meta World #5",
      price: 0.22,
      image: "https://github.com/omsandippatil/Hawala/blob/main/img/nft/6.jpg?raw=true"
    },
    {
      id: 7,
      name: "Digital Ocean #8",
      price: 0.14,
      image: "https://github.com/omsandippatil/Hawala/blob/main/img/nft/7.jpg?raw=true"
    },
    {
      id: 8,
      name: "Neon Dreams #6",
      price: 0.20,
      image: "https://github.com/omsandippatil/Hawala/blob/main/img/nft/8.jpg?raw=true"
    },
    {
      id: 9,
      name: "Digital Dream #1",
      price: 0.05,
      image: "https://github.com/omsandippatil/Hawala/blob/main/img/nft/9.jpg?raw=true"
    },
    {
      id: 10,
      name: "Cosmic Art #4",
      price: 0.12,
      image: "https://github.com/omsandippatil/Hawala/blob/main/img/nft/10.jpg?raw=true"
    },
    {
      id: 11,
      name: "Future Vision #7",
      price: 0.08,
      image: "https://github.com/omsandippatil/Hawala/blob/main/img/nft/11.jpg?raw=true"
    },
    {
      id: 12,
      name: "Digital Beast #2",
      price: 0.15,
      image: "https://github.com/omsandippatil/Hawala/blob/main/img/nft/12.jpg?raw=true"
    },
    {
      id: 13,
      name: "Cyber Punk #3",
      price: 0.18,
      image: "https://github.com/omsandippatil/Hawala/blob/main/img/nft/13.jpg?raw=true"
    },
    {
      id: 14,
      name: "Meta World #5",
      price: 0.22,
      image: "https://github.com/omsandippatil/Hawala/blob/main/img/nft/14.jpg?raw=true"
    },
    {
      id: 15,
      name: "Digital Ocean #8",
      price: 0.14,
      image: "https://github.com/omsandippatil/Hawala/blob/main/img/nft/15.jpg?raw=true"
    },
    {
      id: 16,
      name: "Neon Dreams #6",
      price: 0.20,
      image: "https://github.com/omsandippatil/Hawala/blob/main/img/nft/16.jpg?raw=true"
    }
  ]);

  const [loading, setLoading] = useState<boolean>(false);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0.0");
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [balanceLoading, setBalanceLoading] = useState<boolean>(false);

  const checkBalance = async (address: string) => {
    try {
      setBalanceLoading(true);
      if (!window.ethereum) throw new Error("No ethereum provider found");
      
      const provider = new BrowserProvider(window.ethereum);
      const tokenContract = new Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
      const decimals = await tokenContract.decimals();
      const balance = await tokenContract.balanceOf(address);
      const formattedBalance = formatUnits(balance, decimals);
      setBalance(parseFloat(formattedBalance).toFixed(2));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance("0.0");
    } finally {
      setBalanceLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) throw new Error("No ethereum provider found");
      
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      await checkBalance(accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const purchaseNFT = async (nft: NFT) => {
    setLoading(true);
    setBuyingId(nft.id);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    setShowSuccess(true);
    createConfetti();
    
    setTimeout(() => {
      setLoading(false);
      setBuyingId(null);
      setShowSuccess(false);
    }, 3000);
  };

  const createConfetti = () => {
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'absolute w-2 h-2 rotate-45 animate-confetti';
      confetti.style.background = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'][Math.floor(Math.random() * 5)];
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.animationDelay = `${Math.random() * 3}s`;
      confetti.style.opacity = Math.random().toString();
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 relative">
      <style>
        {`
          @keyframes confetti-fall {
            0% { transform: translateY(-100vh) rotate(0deg); }
            100% { transform: translateY(100vh) rotate(360deg); }
          }
          .animate-confetti {
            animation: confetti-fall 5s linear forwards;
          }
        `}
      </style>

      <div className="max-w-7xl mx-auto">
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Purchase Successful!</h2>
              <p className="text-gray-600">Your NFT has been added to your collection</p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">NFT Collection</h1>
          <div className="flex gap-4 items-center">
            {account && (
              <div className="text-sm bg-white shadow rounded-lg px-4 py-2 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                <span className="font-medium">
                  {balanceLoading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    `${balance} Tokens`
                  )}
                </span>
              </div>
            )}
            <UIButton onClick={connectWallet} disabled={!!account}>
              {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
            </UIButton>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {nfts.map((nft) => (
            <Card key={nft.id} className="overflow-hidden bg-white hover:shadow-lg transition-shadow">
              <div className="relative h-64">
                <img 
                  src={nft.image} 
                  alt={nft.name} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h2 className="text-lg font-semibold mb-1">{nft.name}</h2>
                  <p className="text-base font-medium mb-3">{nft.price} RUPA</p>
                  <UIButton 
                    className="w-full bg-white text-black hover:bg-gray-200" 
                    onClick={() => purchaseNFT(nft)}
                    disabled={loading || !account}
                  >
                    {loading && buyingId === nft.id ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      "Buy Now"
                    )}
                  </UIButton>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NFTMarketplace;