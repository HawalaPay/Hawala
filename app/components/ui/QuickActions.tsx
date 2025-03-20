import React from "react";
import { Send, Wallet, CreditCard, Coins, Image } from "lucide-react";

const QuickAction = ({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<any>;
  label: string;
  onClick?: () => void;
}) => (
  <button
    className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
    onClick={onClick}
  >
    <Icon className="w-6 h-6 text-gray-600" />
    <span className="text-xs mt-1 text-gray-600">{label}</span>
  </button>
);

const QuickActions = ({
  onSendClick,
  onRequestClick,
  onBuyCardClick,
}: {
  onSendClick: () => void;
  onRequestClick: () => void;
  onBuyCardClick: () => void;
}) => {
  const handleNFTClick = () => {
    window.location.href = "/nft";
  };

  const handleBuyCryptoClick = () => {
    window.location.href = "/buy-crypto";
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="flex space-x-4">
        <QuickAction icon={Send} label="Send" onClick={onSendClick} />
        <QuickAction icon={Wallet} label="Request" onClick={onRequestClick} />
        <QuickAction icon={CreditCard} label="Cards" onClick={onBuyCardClick} />
        <QuickAction icon={Image} label="NFT" onClick={handleNFTClick} />
        <QuickAction icon={Coins} label="Crypto" onClick={handleBuyCryptoClick} />
      </div>
    </div>
  );
};

export default QuickActions;
