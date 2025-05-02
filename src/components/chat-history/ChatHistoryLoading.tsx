
import React from 'react';
import { Loader2 } from 'lucide-react';

const ChatHistoryLoading: React.FC = () => {
  return (
    <div className="flex justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  );
};

export default ChatHistoryLoading;
