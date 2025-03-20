import React, { useState, useEffect } from "react";
import { Send, User, Search, ArrowRight, X, Wallet, ChevronLeft, Check } from "lucide-react";
import { sendTokens } from "@/utils/send-rupa";
import { ethers } from "ethers";

interface Contact {
  id: number;
  name: string;
  image: string;
  lastAmount: string;
  address: string;
}

interface SendMoneyProps {
  onClose: () => void;
}

const SendMoney: React.FC<SendMoneyProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);

  const quickAmounts = [500, 1000, 2000, 5000];

  const contacts: Contact[] = [
    { 
      id: 1, 
      name: "Prakash Magesh", 
      image: "/api/placeholder/40/40", 
      lastAmount: "2,500", 
      address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" 
    },
    { 
      id: 2, 
      name: "Irfan Shaikh", 
      image: "/api/placeholder/40/40", 
      lastAmount: "1,800", 
      address: "0x123d35Cc6634C0532925a3b844Bc454e4438f123" 
    },
    { 
      id: 3, 
      name: "Soham Patil", 
      image: "/api/placeholder/40/40", 
      lastAmount: "3,200", 
      address: "0x456d35Cc6634C0532925a3b844Bc454e4438f456" 
    },
  ];

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: "eth_accounts" 
        }) as string[];
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking wallet:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ 
        method: "eth_requestAccounts" 
      }) as string[];
      setWalletAddress(accounts[0]);
    } catch (error) {
      console.error("Error connecting:", error);
      alert("Failed to connect wallet");
    }
    setIsConnecting(false);
  };

  const handleSend = async () => {
    if (!selectedContact || !amount || !walletAddress) {
      alert("Please fill in all required fields and connect wallet!");
      return;
    }

    if (!ethers.isAddress(selectedContact.address)) {
      alert("Invalid recipient address!");
      return;
    }

    setLoading(true);
    try {
      const transactionHash = await sendTokens(selectedContact.address, amount);
      setLoading(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 3000);

      console.log(`Transaction hash: ${transactionHash}`);
    } catch (error) {
      setLoading(false);
      console.error("Transaction failed:", error);
      alert("Payment failed. Please try again.");
    }
  };

  const ContactSelect = () => (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          placeholder="Search name or paste address..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {contacts
          .filter(contact => 
            contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.address.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((contact) => (
            <div
              key={contact.id}
              onClick={() => {
                setSelectedContact(contact);
                setStep(2);
              }}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <img 
                    src={contact.image} 
                    alt={contact.name} 
                    className="w-full h-full rounded-full"
                  />
                </div>
                <div>
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-gray-500">Last: ₹{contact.lastAmount}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          ))}
      </div>
    </div>
  );

  const AmountInput = () => {
    if (!selectedContact) return null;

    return (
      <div className="space-y-6">
        {!walletAddress && (
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full px-4 py-3 bg-black text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-gray-800 transition-colors"
          >
            {isConnecting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </>
            )}
          </button>
        )}
        
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-gray-100 mx-auto flex items-center justify-center">
            <img 
              src={selectedContact.image} 
              alt={selectedContact.name} 
              className="w-full h-full rounded-full"
            />
          </div>
          <h3 className="font-medium text-lg">{selectedContact.name}</h3>
          <p className="text-sm text-gray-500 break-all">{selectedContact.address}</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">₹</span>
            <input
              type="text"
              value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="0"
              className="w-full pl-10 pr-4 py-3 text-2xl font-bold text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount.toString())}
                className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ₹{quickAmount}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={note}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
          placeholder="Add a note (optional)"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none h-24"
        />

        <button
          onClick={() => setStep(3)}
          disabled={!amount || !walletAddress}
          className="w-full px-4 py-3 bg-black text-white rounded-lg disabled:opacity-50 hover:bg-gray-800 transition-colors"
        >
          Continue
        </button>
      </div>
    );
  };

  const ConfirmPayment = () => (
    <div className="space-y-6">
      <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Amount</span>
          <span className="font-medium text-lg">₹{Number(amount).toLocaleString()}</span>
        </div>
        {note && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Note</span>
            <span className="font-medium">{note}</span>
          </div>
        )}
      </div>

      <button
        onClick={handleSend}
        disabled={loading}
        className="w-full px-4 py-3 bg-black text-white rounded-lg disabled:opacity-50 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        ) : (
          <>
            <Send className="w-4 h-4" />
            Send Payment
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl">
        <div className="p-4 border-b relative flex justify-between items-center">
          <div className="w-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
          <h2 className="text-xl font-semibold">
            {step === 1 && "Send Money"}
            {step === 2 && "Enter Amount"}
            {step === 3 && "Confirm Payment"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && <ContactSelect />}
          {step === 2 && <AmountInput />}
          {step === 3 && <ConfirmPayment />}
        </div>

        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white p-8 rounded-2xl text-center max-w-sm mx-4 w-full">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600 animate-[scale_0.5s_ease-in-out]" />
              </div>
              <h3 className="text-xl font-semibold text-green-600 mb-2">
                Payment Successful!
              </h3>
              <p className="text-gray-600">
                ₹{Number(amount).toLocaleString()} has been sent to {selectedContact?.name}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendMoney;