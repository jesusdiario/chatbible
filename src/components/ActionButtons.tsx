
import React from "react";
import ActionButton from "@/components/ActionButton";
import { actionButtonsData } from "@/data/actionButtonsData";
import { ChatContext } from "@/contexts/ChatContext";

const ActionButtons = () => {
  return (
    <div className="flex gap-2 flex-wrap justify-center mt-4">
      {actionButtonsData.map((action) => (
        <ActionButton 
          key={action.label} 
          icon={action.icon} 
          label={action.label} 
          prompt={action.prompt} 
        />
      ))}
    </div>
  );
};

export default ActionButtons;
export { ChatContext };
