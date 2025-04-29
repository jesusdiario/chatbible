
import React, { useState } from "react";
import { Menu, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ChatHistoryList from "@/components/ChatHistoryList";
import { useQuery } from "@tanstack/react-query";
import { categorizeChatHistory } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const ChatHeader = ({
  isSidebarOpen,
  onToggleSidebar
}: ChatHeaderProps) => {
  const location = useLocation();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Don't render on auth page
  if (location.pathname === "/auth") {
    return null;
  }

  // Fetch chat history
  const { data: chatHistory = [] } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];
      
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', session.user.id)
        .order('last_accessed', { ascending: false });
      
      if (error) {
        console.error('Error fetching chat history:', error);
        return [];
      }
      
      return data.map(item => ({
        id: item.id,
        title: item.title,
        lastAccessed: new Date(item.last_accessed),
        user_id: item.user_id,
        book_slug: item.book_slug,
        last_message: item.last_message,
        slug: item.slug
      }));
    },
  });

  const timeframes = categorizeChatHistory(chatHistory);
  const toggleHistorySidebar = () => setIsHistoryOpen(!isHistoryOpen);

  return (
    <header className="fixed top-0 z-30 w-full border-b border-gray-200 bg-chatgpt-main">
      <div className="flex h-[60px] items-center justify-between px-4">
        {/* Left section - Menu toggle */}
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleSidebar}
            className="hover:bg-chatgpt-secondary"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Center section - Logo */}
        <div className={`absolute left-1/2 transform -translate-x-1/2 transition-all duration-300 ${isSidebarOpen ? 'md:left-[calc(50%+128px)]' : ''}`}>
          <h1 className="text-xl font-bold">BibleChat</h1>
        </div>

        {/* Right section - History sidebar */}
        <div className="flex items-center">
          <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-chatgpt-secondary"
                onClick={toggleHistorySidebar}
              >
                <History className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
              <div className="h-full overflow-y-auto">
                <ChatHistoryList chatHistory={timeframes} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
