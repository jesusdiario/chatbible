
import { Menu, Search, X, MessageSquare, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ChatHistory, categorizeChatHistory } from "@/types/chat";
import { useNavigate } from "react-router-dom";
import SubscriptionModal from "@/components/SubscriptionModal";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onChatSelect?: (chatId: string) => void;
  chatHistory?: ChatHistory[];
  currentPath?: string;
}

const Sidebar = ({
  isOpen,
  onToggle,
  onChatSelect,
  chatHistory = [],
  currentPath
}: SidebarProps) => {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const navigate = useNavigate();

  const goToLivrosDaBiblia = () => {
    navigate('/livros-da-biblia');
  };

  const timeframes = categorizeChatHistory(chatHistory);

  const handleChatClick = (chatId: string, slug: string, bookSlug?: string) => {
    if (bookSlug) {
      navigate(`/livros-da-biblia/${bookSlug}/${slug}`);
    } else {
      navigate(`/chat/${slug}`);
    }
    onChatSelect?.(chatId);
    
    if (window.innerWidth < 768) {
      onToggle();
    }
  };

  return <>
      <div className={cn("fixed top-0 left-0 z-40 h-screen transition-all duration-300", 
                        "bg-white border-r", isOpen ? "w-full md:w-64" : "w-0")}>
        <nav className="flex h-full w-full flex-col p-4" aria-label="Histórico de Conversas">
          <div className="flex justify-between items-center mb-6 mt-2">
            <h1 className="text-xl font-bold">CHAT A.I+</h1>
            <button onClick={onToggle} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100">
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {isOpen && (
            <>
              <div className="flex gap-2 mb-6">
                <Button 
                  onClick={() => navigate('/chat/new')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" /> New chat
                </Button>
                <Button 
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => console.log('Search clicked')}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">Your conversations</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-600 hover:bg-transparent hover:text-blue-800"
                  onClick={() => console.log('Clear all clicked')}
                >
                  Clear All
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                {timeframes && timeframes.length > 0 ? (
                  <div className="space-y-2">
                    {timeframes.map(timeframe => (
                      <div key={timeframe.title}>
                        <span className="text-xs text-gray-500 pl-2">{timeframe.title}</span>
                        <div className="space-y-1 mt-2">
                          {timeframe.items.map(item => (
                            <TooltipProvider key={item.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button 
                                    className={cn(
                                      "w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left",
                                      currentPath?.includes(item.slug || '') 
                                        ? "bg-gray-100" 
                                        : "hover:bg-gray-50"
                                    )}
                                    onClick={() => handleChatClick(item.id, item.slug || '', item.book_slug)}
                                  >
                                    <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                    <span className="text-sm truncate">{item.title}</span>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="right">{item.title}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                        <Separator className="my-3" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-center text-gray-500 py-4">
                    Nenhuma conversa recente
                  </div>
                )}
              </div>
            </>
          )}

          {isOpen && (
            <div className="mt-auto pt-3 border-t">
              <button 
                className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setShowSubscriptionModal(true)}
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs">UP</span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">Upgrade Pro</div>
                  <div className="text-xs text-gray-500">Libere + Mensagens</div>
                </div>
              </button>
            </div>
          )}
        </nav>
      </div>
      
      {isOpen && <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={onToggle} aria-hidden="true" />}
      
      <SubscriptionModal isOpen={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} />
    </>;
};

export default Sidebar;
