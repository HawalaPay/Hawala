import { ethers } from 'ethers';

const ERC20_ABI = [
  // Added more comprehensive ABI
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function decimals() external view returns (uint8)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

const RUPA_CONTRACT_ADDRESS = "0xfD4eCAfDFd435cd23E90Da010E3E8b4e791A3D21";

export async function sendTokens(
  recipientAddress: string,
  amount: string
): Promise<string> {
  try {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    // Validate recipient address
    if (!ethers.isAddress(recipientAddress)) {
      throw new Error("Invalid recipient address");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    const tokenContract = new ethers.Contract(
      RUPA_CONTRACT_ADDRESS,
      ERC20_ABI,
      signer
    );

    // Get the token's decimals
    const decimals = await tokenContract.decimals();
    const amountInWei = ethers.parseUnits(amount, decimals);

    try {
      // Prepare the transaction data
      const populatedTransaction = await tokenContract.transfer.populateTransaction(
        recipientAddress,
        amountInWei
      );

      // Estimate gas using the provider
      const gasEstimate = await provider.estimateGas({
        from: await signer.getAddress(),
        to: RUPA_CONTRACT_ADDRESS,
        data: populatedTransaction.data,
      });

      console.log('Estimated Gas:', gasEstimate.toString());

      // Send the transaction
      const transaction = await tokenContract.transfer(
        recipientAddress,
        amountInWei,
        {
          gasLimit: Math.ceil(Number(gasEstimate) * 1.2), // Add 20% buffer to gas estimate
        }
      );

      // Wait for the transaction to be mined
      const receipt = await transaction.wait();
      
      console.log('Transaction successful with hash:', receipt?.hash);
      return receipt?.hash || '';

    } catch (error: any) {
      console.error("Transaction error:", error);
      throw new Error(error.message || "Failed to send transaction");
    }

  } catch (error: any) {
    console.error("Error in sendTokens:", error);
    if (error?.code) {
      console.error("Error Code:", error.code);
    }
    if (error?.data) {
      console.error("Error Data:", error.data);
    }
    
    // Handle user rejection
    if (error?.code === "ACTION_REJECTED") {
      throw new Error("Transaction was rejected by user");
    }
    
    // Handle insufficient funds
    if (error?.message?.includes("insufficient funds")) {
      throw new Error("Insufficient funds for transaction");
    }

    // Handle other errors
    throw new Error(error.message || "Transaction failed");
  }
}