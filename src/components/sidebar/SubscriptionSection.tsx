
import React from "react";

interface SubscriptionSectionProps {
  onOpenSubscriptionModal: () => void;
}

const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({ onOpenSubscriptionModal }) => {
  return (
    <div className="w-full">
      <button 
        className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100" 
        onClick={onOpenSubscriptionModal}
      >
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-xs">UP</span>
        </div>
        <div className="text-left">
          <div className="text-sm font-medium">Upgrade Pro</div>
          <div className="text-xs text-gray-500">Libere + Mensagens</div>
        </div>
      </button>
    </div>
  );
};

export default SubscriptionSection;
