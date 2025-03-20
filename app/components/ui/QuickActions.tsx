import React from "react";
import { Send, Wallet, CreditCard, Coins, Image, Clock, HelpCircle } from "lucide-react";

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
  onAutomaticPaymentClick,
  onSupportClick,
}: {
  onSendClick: () => void;
  onRequestClick: () => void;
  onBuyCardClick: () => void;
  onAutomaticPaymentClick?: () => void;
  onSupportClick?: () => void;
}) => {
  const handleNFTClick = () => {
    window.location.href = "/nft";
  };
  
  const handleBuyCryptoClick = () => {
    window.location.href = "/buy-crypto";
  };
  
  const handleAutomaticPaymentClick = () => {
    onAutomaticPaymentClick ? onAutomaticPaymentClick() : window.location.href = "/auto-pay";
  };
  
  const handleSupportClick = () => {
    onSupportClick ? onSupportClick() : window.location.href = "/support";
  };
  
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="flex flex-wrap gap-4">
        <QuickAction icon={Send} label="Send" onClick={onSendClick} />
        <QuickAction icon={Wallet} label="Request" onClick={onRequestClick} />
        <QuickAction icon={CreditCard} label="Cards" onClick={onBuyCardClick} />
        <QuickAction icon={Image} label="NFT" onClick={handleNFTClick} />
        <QuickAction icon={Coins} label="Crypto" onClick={handleBuyCryptoClick} />
        <QuickAction icon={Clock} label="Auto Pay" onClick={handleAutomaticPaymentClick} />
        <QuickAction icon={HelpCircle} label="Support" onClick={handleSupportClick} />
      </div>
    </div>
  );
};

export default QuickActions;