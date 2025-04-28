
import React from "react";
import { Menu, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import ChatHistoryList from "@/components/ChatHistoryList";
import { useQuery } from "@tanstack/react-query";
import { categorizeChatHistory } from "@/types/chat";

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  onNewChat?: () => void;
  onToggleSidebar?: () => void;
}

const ChatHeader = ({
  isSidebarOpen,
  onToggleSidebar
}: ChatHeaderProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch chat history for the drawer
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

  return (
    <header className="fixed top-0 z-30 w-full border-b border-gray-200 bg-chatgpt-main">
      <div className="flex h-[60px] items-center justify-between px-4">
        {/* Left section - Menu toggle */}
        <div className="flex items-center">
          {onToggleSidebar && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggleSidebar}
              className="hover:bg-chatgpt-secondary"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Center section - Logo */}
        <div className={`absolute left-1/2 transform -translate-x-1/2 transition-all duration-300 ${isSidebarOpen ? 'md:left-[calc(50%+128px)]' : ''}`}>
          <h1 className="text-xl font-bold">BibleChat</h1>
        </div>

        {/* Right section - History drawer trigger */}
        <div className="flex items-center">
          <Drawer>
            <DrawerTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-chatgpt-secondary"
              >
                <History className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[80vh]">
              <div className="mx-auto w-full max-w-lg p-6">
                <ChatHistoryList chatHistory={timeframes} />
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
