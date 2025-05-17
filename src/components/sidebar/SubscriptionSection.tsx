
import React from "react";
import { CreditCard } from "lucide-react";

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
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <CreditCard className="h-4 w-4 text-primary" />
        </div>
        <div className="text-left">
          <div className="text-sm font-medium">Upgrade Pro</div>
          <div className="text-xs text-gray-500">Mensagens Ilimitadas!</div>
        </div>
      </button>
    </div>
  );
};

export default SubscriptionSection;
