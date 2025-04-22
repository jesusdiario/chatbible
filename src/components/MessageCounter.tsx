
import React from "react";

interface MessageCounterProps {
  currentCount: number;
  limit: number;
  isLoading: boolean;
}

const MessageCounter = ({ currentCount, limit, isLoading }: MessageCounterProps) => {
  if (isLoading) return null;
  
  return (
    <div className="w-full text-xs text-gray-500 mt-1 text-right">
      {currentCount}/{limit} mensagens enviadas este mês
    </div>
  );
};

export default MessageCounter;
