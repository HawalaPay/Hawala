import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';

// Define window.ethereum type
declare global {
  interface Window {
    methereum?: ethers.Eip1193Provider;
  }
}

// ERC20 ABI for balanceOf function
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

// Types
interface StatsResponse {
  label: string;
  amount: string;
  trend?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatsResponse[] | { error: string }>
) {
  try {
    // Check if MetaMask is connected
    if (typeof window === 'undefined') {
      throw new Error('This endpoint must be called from the client side');
    }

    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Contract addresses
    const contractAddresses = [
      '0xfD4eCAfDFd435cd23E90Da010E3E8b4e791A3D21',
      '0x455e53cbb86018ac2b8092fdcd39d8444affc3f6'
    ];

    // Get connected account
    const accounts = await provider.send('eth_requestAccounts', []);
    if (!accounts || accounts.length === 0) {
      throw new Error('No MetaMask account connected');
    }
    const userAddress = accounts[0];

    // Fetch balances for both contracts
    const balancePromises = contractAddresses.map(async (contractAddress) => {
      const contract = new ethers.Contract(
        contractAddress,
        ERC20_ABI,
        provider
      );

      const [balance, decimals, symbol] = await Promise.all([
        contract.balanceOf(userAddress),
        contract.decimals(),
        contract.symbol()
      ]);

      const formattedBalance = ethers.formatUnits(balance, decimals);
      
      return {
        label: `${symbol} Balance`,
        amount: formattedBalance,
        trend: 0 // You can implement trend calculation if needed
      };
    });

    const stats = await Promise.all(balancePromises);

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching token balances:', error);
    res.status(500).json({ error: 'Failed to fetch token balances' });
  }
}