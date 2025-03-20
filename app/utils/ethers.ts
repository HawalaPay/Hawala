import { ethers, parseEther, formatEther } from 'ethers';

// Get the provider connected to Ethereum network (use Infura, Alchemy, or any provider)
export const getProvider = () => {
  const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_API_URL);
  return provider;
};

// Get the wallet from a private key
export const getWallet = (privateKey: string, provider: ethers.JsonRpcProvider) => {
  const wallet = new ethers.Wallet(privateKey, provider);
  return wallet;
};

// Convert Ether to Wei (for transactions)
export const toWei = (amount: string) => {
  return parseEther(amount);
};

// Convert Wei to Ether (for display)
export const fromWei = (amount: string) => {
  return formatEther(amount);
};

// Send Ether to another address
export const sendEther = async (recipient: string, amount: string) => {
  const provider = getProvider();
  const wallet = getWallet(process.env.PRIVATE_KEY!, provider);

  // Create and send the transaction
  const tx = await wallet.sendTransaction({
    to: recipient,
    value: toWei(amount),
  });

  // Wait for the transaction to be mined
  const receipt = await tx.wait();
  return receipt;
};
