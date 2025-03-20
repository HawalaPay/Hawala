"use client";

import React, { useState, useEffect } from "react";
import { Alerta, AlertDescriptiona } from "@/components/ui/alert";

const Login: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check MetaMask availability
  const checkMetaMaskAvailability = (): boolean => {
    if (!window?.ethereum?.isMetaMask) {
      setError("MetaMask is not installed. Please install it from metamask.io");
      return false;
    }
    return true;
  };

  // Connect to MetaMask wallet
  const connectWallet = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError("");

      if (!checkMetaMaskAvailability()) return;

      const accounts = await window.ethereum?.request({
        method: "eth_requestAccounts",
      }) as string[]; // Type assertion to string[]

      if (accounts && accounts[0]) {
        setWalletAddress(accounts[0]);
        window.location.href = "/home"; // Navigate to home page
      }
    } catch (err) {
      console.error("Connection Error:", err);
      setError("Failed to connect wallet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkMetaMaskAvailability();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
        <div className="p-4 border-b">
          <h2 className="text-4xl font-bold text-center tracking-tight">Hawala</h2>
          <p className="text-center text-gray-500 font-light">
            The future of seamless crypto transactions
          </p>
        </div>
        <div className="p-4">
          {error && (
            <Alerta className="text-sm mb-4">
              <AlertDescriptiona>{error}</AlertDescriptiona>
            </Alerta>
          )}

          {!walletAddress ? (
            <button
              className="w-full h-12 bg-black hover:bg-gray-800 text-white font-light rounded-lg"
              onClick={connectWallet}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Connecting...
                </span>
              ) : (
                "Connect Wallet"
              )}
            </button>
          ) : (
            <div className="p-4 rounded-lg bg-gray-50 space-y-2">
              <p className="text-sm text-gray-500 font-light">Connected Wallet</p>
              <p className="font-mono text-sm break-all">{walletAddress}</p>
              <p className="text-sm text-gray-500 animate-pulse font-light">
                Redirecting...
              </p>
            </div>
          )}

          <div className="relative mt-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 font-light tracking-wider">
                Secure Connection
              </span>
            </div>
          </div>

          <p className="text-xs text-center text-gray-400 font-light mt-2">
            By connecting, you agree to our Terms and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
