import { NextApiRequest, NextApiResponse } from 'next';
import { ethers, parseEther } from 'ethers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { recipient, amount } = req.body;

  try {
    const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_API_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

    const tx = await wallet.sendTransaction({
      to: recipient,
      value: parseEther(amount),
    });

    await tx.wait();

    res.status(200).json({ success: true, txHash: tx.hash });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
}
