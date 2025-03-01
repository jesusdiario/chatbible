
import React from "react";

interface MessageLimitCounterProps {
  current: number;
  limit: number;
  isLoading: boolean;
}

const MessageLimitCounter = ({ current, limit, isLoading }: MessageLimitCounterProps) => {
  if (isLoading) return null;
  
  return (
    <div className="w-full text-xs text-gray-500 mt-1 text-right">
      {current}/{limit} mensagens enviadas este mês
    </div>
  );
};

export default MessageLimitCounter;
