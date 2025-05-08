
import React, { useState, useEffect } from "react";
import { Menu, History, Search, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ChatHistoryList from "@/components/ChatHistoryList";
import { useQuery } from "@tanstack/react-query";
import { categorizeChatHistory } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const ChatHeader = ({
  isSidebarOpen,
  onToggleSidebar
}: ChatHeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Don't render on auth page
  if (location.pathname === "/auth") {
    return null;
  }
  
  // Setup keyboard shortcut for command dialog
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Fetch chat history
  const { data: chatHistory = [], refetch: refetchHistory } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];
      
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_deleted', false)
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
        slug: item.slug,
        subscription_required: item.subscription_required,
        is_accessible: item.is_accessible,
        is_deleted: item.is_deleted,
        pinned: item.pinned || false
      }));
    },
  });

  const allChats = chatHistory || [];
  const filteredChats = allChats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (chat.last_message && chat.last_message.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const timeframes = categorizeChatHistory(filteredChats);
  const toggleHistorySidebar = () => setIsHistoryOpen(!isHistoryOpen);

  const handleChatSelect = (slug: string) => {
    setCommandOpen(false);
    setIsHistoryOpen(false);
    navigate(`/chat/${slug}`);
  };

  return (
    <header className="fixed top-0 z-30 w-full border-b border-gray-200 bg-white shadow-sm mb-[30px] md:mb-[40px] lg:mb-[50px]">
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
          <h1 className="text-xl font-bold">Discipler</h1>
        </div>

        {/* Right section - Search and History sidebar */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex items-center gap-1 text-sm"
            onClick={() => setCommandOpen(true)}
          >
            <Search className="h-3.5 w-3.5" />
            <span>Buscar</span>
            <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
          
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
                <ChatHistoryList 
                  chatHistory={timeframes} 
                  onChatSelect={handleChatSelect}
                  onHistoryUpdated={refetchHistory}
                />
              </div>
            </SheetContent>
          </Sheet>
          
          <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
            <CommandInput
              placeholder="Buscar em todas as conversas..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              {timeframes.map((group) => (
                <CommandGroup key={group.title} heading={group.title}>
                  {group.items.map((chat) => (
                    <CommandItem
                      key={chat.id}
                      onSelect={() => handleChatSelect(chat.slug || '')}
                    >
                      {chat.pinned && <Pin className="mr-2 h-3 w-3 text-blue-500" />}
                      <span>{chat.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </CommandDialog>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
