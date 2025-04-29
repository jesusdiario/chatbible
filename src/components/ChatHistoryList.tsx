
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TimeframedHistory } from '@/types/chat';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2 } from 'lucide-react';
import ChatHistoryItem from './ChatHistoryItem';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface ChatHistoryListProps {
  chatHistory: TimeframedHistory[];
  onChatSelect?: (chatId: string) => void;
  isLoading?: boolean;
  onHistoryUpdated?: () => void;
}

const ChatHistoryList: React.FC<ChatHistoryListProps> = ({ 
  chatHistory, 
  onChatSelect, 
  isLoading = false,
  onHistoryUpdated 
}) => {
  const navigate = useNavigate();
  const [localHistory, setLocalHistory] = useState(chatHistory);
  const { subscribed } = useSubscription();
  
  useEffect(() => {
    setLocalHistory(chatHistory);
  }, [chatHistory]);

  const handleChatClick = (slug: string) => {
    if (onChatSelect) {
      onChatSelect(slug);
    }
    navigate(`/chat/${slug}`);
  };
  
  const handleDeleteChat = (chatId: string) => {
    // Atualizar o estado local para remover o chat excluído
    const updatedHistory = localHistory.map(group => ({
      ...group,
      items: group.items.filter(chat => chat.id !== chatId)
    })).filter(group => group.items.length > 0);
    
    setLocalHistory(updatedHistory);
    
    // Notificar o componente pai para atualizar o histórico global
    if (onHistoryUpdated) {
      onHistoryUpdated();
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (localHistory.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Nenhuma conversa encontrada</p>
        <Button onClick={() => navigate('/chat/new')}>
          Iniciar nova conversa
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <h2 className="text-2xl font-semibold mb-6 text-center">Histórico de Conversas</h2>
      <div className="space-y-6">
        {localHistory.map((group) => (
          <div key={group.title} className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{group.title}</h3>
            <div className="space-y-1">
              {group.items.map((chat) => (
                <ChatHistoryItem
                  key={chat.id}
                  chat={chat}
                  onSelect={handleChatClick}
                  onDelete={handleDeleteChat}
                  isAccessible={subscribed || !chat.subscription_required}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistoryList;
