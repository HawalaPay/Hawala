// pages/api/scanner.ts
import { NextApiRequest, NextApiResponse } from 'next';

interface ScannerRequest extends NextApiRequest {
  body: {
    qrData: string;
  };
}

interface ScannerResponse {
  success: boolean;
  error?: string;
  data?: {
    address: string;
    type: 'ethereum' | 'bitcoin' | 'url' | 'text';
  };
}

export default async function handler(
  req: ScannerRequest,
  res: NextApiResponse<ScannerResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({ 
        success: false, 
        error: 'No QR data provided' 
      });
    }

    // Check for Ethereum address
    if (qrData.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(200).json({
        success: true,
        data: {
          address: qrData,
          type: 'ethereum'
        }
      });
    }

    // Check for Bitcoin address
    if (qrData.match(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/) || 
        qrData.match(/^bc1[ac-hj-np-z02-9]{39,59}$/)) {
      return res.status(200).json({
        success: true,
        data: {
          address: qrData,
          type: 'bitcoin'
        }
      });
    }

    // Check for URLs
    if (qrData.match(/^(https?:\/\/)/i)) {
      return res.status(200).json({
        success: true,
        data: {
          address: qrData,
          type: 'url'
        }
      });
    }

    // If none of the above, treat as text
    return res.status(200).json({
      success: true,
      data: {
        address: qrData,
        type: 'text'
      }
    });

  } catch (error) {
    console.error('Scanner API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process QR code'
    });
  }
}