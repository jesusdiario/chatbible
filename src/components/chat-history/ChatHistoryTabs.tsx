
import React, { useState } from 'react';
import { TimeframedHistory, ChatHistory } from '@/types/chat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChatHistoryTabContent from './ChatHistoryTabContent';

interface ChatHistoryTabsProps {
  chatHistory: TimeframedHistory[];
  onChatSelect: (slug: string) => void;
  onDelete: (id: string) => void;
  onHistoryUpdated?: () => void;
  isSubscribed: boolean;
  searchQuery?: string;
}

const ChatHistoryTabs: React.FC<ChatHistoryTabsProps> = ({
  chatHistory,
  onChatSelect,
  onDelete,
  onHistoryUpdated,
  isSubscribed,
  searchQuery
}) => {
  const [activeTab, setActiveTab] = useState('all');
  
  // Get pinned conversations
  const pinnedChats = chatHistory.length > 0 ? 
    chatHistory
      .flatMap(group => group.items)
      .filter(chat => chat.pinned) : 
    [];

  // Get book conversations
  const bookChats = chatHistory.length > 0 ?
    chatHistory
      .flatMap(group => group.items)
      .filter(chat => chat.book_slug) :
    [];
    
  const isEmptyHistory = chatHistory.length === 0 || chatHistory.every(group => group.items.length === 0);
  const isEmptyPinned = pinnedChats.length === 0;
  const isEmptyBooks = bookChats.length === 0;

  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
      <TabsList className="grid grid-cols-3">
        <TabsTrigger value="all">Todos</TabsTrigger>
        <TabsTrigger value="pinned" disabled={pinnedChats.length === 0}>Fixados</TabsTrigger>
        <TabsTrigger value="books">Livros</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all">
        <ChatHistoryTabContent
          chatHistory={chatHistory}
          onChatSelect={onChatSelect}
          onDelete={onDelete}
          onHistoryUpdated={onHistoryUpdated}
          isSubscribed={isSubscribed}
          searchQuery={searchQuery}
          isEmpty={isEmptyHistory}
        />
      </TabsContent>
      
      <TabsContent value="pinned">
        <ChatHistoryTabContent
          chatHistory={[]}
          flatChats={pinnedChats}
          onChatSelect={onChatSelect}
          onDelete={onDelete}
          onHistoryUpdated={onHistoryUpdated}
          isSubscribed={isSubscribed}
          isEmpty={isEmptyPinned}
        />
      </TabsContent>
      
      <TabsContent value="books">
        <ChatHistoryTabContent
          chatHistory={[]}
          flatChats={bookChats}
          onChatSelect={onChatSelect}
          onDelete={onDelete}
          onHistoryUpdated={onHistoryUpdated}
          isSubscribed={isSubscribed}
          isEmpty={isEmptyBooks}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ChatHistoryTabs;
