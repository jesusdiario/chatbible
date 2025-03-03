
import React from "react";
import { useChatContext } from "@/contexts/ChatContext";

export interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  prompt: string;
}

const ActionButton = ({ icon, label, prompt }: ActionButtonProps) => {
  const { sendMessage } = useChatContext();

  const handleClick = () => {
    if (sendMessage) {
      sendMessage(prompt);
    }
  };

  return (
    <button 
      className="relative flex h-[42px] items-center gap-1.5 rounded-full border border-[#383737] px-3 py-2 text-start text-[13px] shadow-xxs transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"
      onClick={handleClick}
    >
      {icon}
      {label}
    </button>
  );
};

export default ActionButton;
