
import React from 'react';
import { Loader2 } from 'lucide-react';

const ChatHistoryLoading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-10 w-10 animate-spin text-chatgpt-accent mb-4" />
      <p className="text-sm text-gray-500">Carregando conversas...</p>
    </div>
  );
};

export default ChatHistoryLoading;
