
import React from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { CreditCard } from "lucide-react";

interface SubscriptionSectionProps {
  onOpenSubscriptionModal: () => void;
}

const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({ onOpenSubscriptionModal }) => {
  const { subscriptionTier } = useSubscription();
  
  // Show the upgrade button only for free users
  if (subscriptionTier !== 'FREE' && subscriptionTier !== null) {
    return null;
  }
  
  return (
    <div className="mt-auto border-t pt-3">
      <button 
        className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100" 
        onClick={onOpenSubscriptionModal}
      >
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <CreditCard className="h-4 w-4 text-blue-500" />
        </div>
        <div className="text-left">
          <div className="text-sm font-medium">Upgrade Pro</div>
          <div className="text-xs text-gray-500">Acesso ilimitado</div>
        </div>
      </button>
    </div>
  );
};

export default SubscriptionSection;
