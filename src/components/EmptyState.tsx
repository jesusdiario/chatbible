
import React from 'react';
import ChatInput from '@/components/ChatInput';

interface EmptyStateProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

const EmptyState = ({ onSendMessage, isLoading }: EmptyStateProps) => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-3xl px-4 space-y-4">
        <div>
          <ChatInput 
            onSend={onSendMessage} 
            isLoading={isLoading} 
            placeholder="Exemplo: Crie um esboço para uma pregação sobre João 3:16"
          />
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
