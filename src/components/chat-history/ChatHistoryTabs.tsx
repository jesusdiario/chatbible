
import React, { useState } from 'react';
import { TimeframedHistory, ChatHistory } from '@/types/chat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChatHistoryTabContent from './ChatHistoryTabContent';
import { Clock, Pin } from 'lucide-react';
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
  const pinnedChats = chatHistory.length > 0 ? chatHistory.flatMap(group => group.items).filter(chat => chat.pinned) : [];

  const isEmptyHistory = chatHistory.length === 0 || chatHistory.every(group => group.items.length === 0);
  const isEmptyPinned = pinnedChats.length === 0;
  return <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
      <TabsList className="grid grid-cols-2 mb-6 bg-chatgpt-secondary border border-chatgpt-border">
        <TabsTrigger value="all" className="data-[state=active]:bg-white flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Cronologia</span>
        </TabsTrigger>
        
        <TabsTrigger value="pinned" disabled={pinnedChats.length === 0} className="data-[state=active]:bg-white flex items-center gap-2">
          <Pin className="h-4 w-4" />
          <span>Fixados</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="animate-fade-in">
        <ChatHistoryTabContent chatHistory={chatHistory} onChatSelect={onChatSelect} onDelete={onDelete} onHistoryUpdated={onHistoryUpdated} isSubscribed={isSubscribed} searchQuery={searchQuery} isEmpty={isEmptyHistory} />
      </TabsContent>
      
      <TabsContent value="pinned" className="animate-fade-in">
        <ChatHistoryTabContent chatHistory={[]} flatChats={pinnedChats} onChatSelect={onChatSelect} onDelete={onDelete} onHistoryUpdated={onHistoryUpdated} isSubscribed={isSubscribed} isEmpty={isEmptyPinned} />
      </TabsContent>
    </Tabs>;
};
export default ChatHistoryTabs;
