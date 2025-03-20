import React, { useState } from "react";
import { X, CreditCard, ChevronLeft, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BuyCoinsProps {
  onClose: () => void;
}

const BuyCoins: React.FC<BuyCoinsProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");

  const popularAmounts = [
    { value: "5000", label: "5,000 Rs" },
    { value: "10000", label: "10,000 Rs" },
    { value: "25000", label: "25,000 Rs" },
    { value: "50000", label: "50,000 Rs" }
  ];

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    // Show success or handle next steps
    onClose();
  };

  const AmountSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Select Amount</h3>
        <p className="text-sm text-gray-500">Choose how many RUPA you want to buy</p>
      </div>

      <div className="space-y-4">
        <div className="relative mt-2">
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="0"
            className="w-full px-4 py-3 text-2xl font-bold text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-medium">
            RUPA
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {popularAmounts.map((amt) => (
            <button
              key={amt.value}
              onClick={() => setAmount(amt.value)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-semibold">{amt.label}</div>
              <div className="text-sm text-gray-500">{amt.label} coins</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setStep(2)}
        disabled={!amount}
        className="w-full py-3 px-4 bg-black text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
      >
        Continue
      </button>
    </div>
  );

  const PaymentDetails = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-2">
          <Lock className="w-4 h-4" />
          <span>Secure Payment</span>
        </div>
        <p className="font-medium">Total Amount: {parseInt(amount).toLocaleString()} RUPA</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
          <div className="relative">
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              maxLength={19}
              placeholder="1234 5678 9012 3456"
              className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
            <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
            <input
              type="text"
              value={expiryDate}
              onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
              maxLength={5}
              placeholder="MM/YY"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
            <input
              type="password"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/[^\d]/g, ""))}
              maxLength={3}
              placeholder="123"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="JOHN SMITH"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 uppercase"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!cardNumber || !expiryDate || !cvv || !name || loading}
        className="w-full py-3 px-4 bg-black text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
        ) : (
          <>
            <span>Pay {parseInt(amount).toLocaleString()} RUPA</span>
          </>
        )}
      </button>

      <div className="text-center text-sm text-gray-500">
        <div className="flex items-center justify-center space-x-2">
          <Lock className="w-4 h-4" />
          <span>Your payment info is secure and encrypted</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {step === 2 && (
                <button
                  className="h-8 w-8 p-2 rounded-full hover:bg-gray-50"
                  onClick={() => setStep(1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <h2 className="text-xl font-medium">
                {step === 1 ? "Buy RUPA" : "Payment Details"}
              </h2>
            </div>
            <button
              className="h-8 w-8 p-2 rounded-full hover:bg-gray-50"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <CardContent className="p-4">
          {step === 1 ? <AmountSelection /> : <PaymentDetails />}
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyCoins;