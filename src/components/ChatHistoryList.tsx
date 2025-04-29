import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TimeframedHistory } from '@/types/chat';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2 } from 'lucide-react';
import ChatHistoryItem from './chat-history/ChatHistoryItem';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmptyState from './EmptyState';

interface ChatHistoryListProps {
  chatHistory: TimeframedHistory[];
  onChatSelect?: (chatId: string) => void;
  isLoading?: boolean;
  onHistoryUpdated?: () => void;
  searchQuery?: string;
}

const ChatHistoryList: React.FC<ChatHistoryListProps> = ({ 
  chatHistory, 
  onChatSelect, 
  isLoading = false,
  onHistoryUpdated,
  searchQuery
}) => {
  const navigate = useNavigate();
  const [localHistory, setLocalHistory] = useState(chatHistory);
  const { subscribed } = useSubscription();
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    setLocalHistory(chatHistory);
  }, [chatHistory]);

  // Get pinned conversations
  const pinnedChats = chatHistory.length > 0 ? 
    chatHistory
      .flatMap(group => group.items)
      .filter(chat => chat.pinned) : 
    [];

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

  const isEmptyHistory = localHistory.length === 0 || localHistory.every(group => group.items.length === 0);

  if (isEmptyHistory) {
    return searchQuery ? (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Nenhuma conversa encontrada para "{searchQuery}"</p>
        <Button onClick={() => navigate('/chat/new')}>
          Iniciar nova conversa
        </Button>
      </div>
    ) : (
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
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="pinned" disabled={pinnedChats.length === 0}>Fixados</TabsTrigger>
          <TabsTrigger value="books">Livros</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
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
                    onHistoryUpdated={onHistoryUpdated}
                    isAccessible={subscribed || !chat.subscription_required}
                  />
                ))}
              </div>
            </div>
          ))}
        </TabsContent>
        
        <TabsContent value="pinned" className="space-y-6">
          {pinnedChats.length > 0 ? (
            <div className="space-y-1">
              {pinnedChats.map((chat) => (
                <ChatHistoryItem
                  key={chat.id}
                  chat={chat}
                  onSelect={handleChatClick}
                  onDelete={handleDeleteChat}
                  onHistoryUpdated={onHistoryUpdated}
                  isAccessible={subscribed || !chat.subscription_required}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma conversa fixada</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="books" className="space-y-6">
          {localHistory
            .flatMap(group => group.items)
            .filter(chat => chat.book_slug)
            .length > 0 ? (
              <div className="space-y-1">
                {localHistory
                  .flatMap(group => group.items)
                  .filter(chat => chat.book_slug)
                  .map((chat) => (
                    <ChatHistoryItem
                      key={chat.id}
                      chat={chat}
                      onSelect={handleChatClick}
                      onDelete={handleDeleteChat}
                      onHistoryUpdated={onHistoryUpdated}
                      isAccessible={subscribed || !chat.subscription_required}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma conversa com livros bíblicos encontrada</p>
              </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatHistoryList;
