
import React from 'react';
import ChatInput from '@/components/ChatInput';
import ActionButtons, { ChatContext } from '@/components/ActionButtons';
import { useMessageCount } from '@/hooks/useMessageCount';
import { useSubscription } from '@/hooks/useSubscription';

interface EmptyChatStateProps {
  title: string;
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  bookSlug?: string;
}

const EmptyChatState = ({ title, onSendMessage, isLoading, bookSlug }: EmptyChatStateProps) => {
  const { canSendMessage } = useMessageCount();
  const { subscribed, startCheckout } = useSubscription();
  
  const handleUpgradeClick = () => {
    // Use o ID do produto real criado na Stripe
    startCheckout('price_1RJfFtLyyMwTutR95rlmrvcA');
  };
  
  return (
    <div className="w-full max-w-3xl px-4 space-y-4">
      <div>
        <h1 className="mb-8 text-3xl md:text-4xl font-semibold text-center">
          Converse sobre {title}
        </h1>
        <ChatInput onSend={onSendMessage} isLoading={isLoading} bookSlug={bookSlug} />
      </div>
      
      {!canSendMessage && !subscribed && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          <p className="font-medium">Você atingiu seu limite mensal de mensagens</p>
          <p>Faça upgrade para o plano Premium para mensagens ilimitadas.</p>
          
          <button 
            onClick={handleUpgradeClick}
            className="mt-2 w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Fazer upgrade para continuar
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyChatState;
