
import { MessageSquare, Globe, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatHistory, categorizeChatHistory } from "@/types/chat";
import { useNavigate } from "react-router-dom";
import ChatHistoryList from "./ChatHistoryList";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onChatSelect?: (chatId: string) => void;
  chatHistory?: ChatHistory[];
  currentPath?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  onChatSelect,
  chatHistory = [],
  currentPath
}) => {
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

  return (
    <>
      <div className={cn(
        "fixed top-0 left-0 z-40 h-screen transition-all duration-300",
        "bg-chatgpt-sidebar",
        isOpen ? "w-full md:w-64" : "w-0"
      )}>
        <nav className="flex h-full w-full flex-col" aria-label="Histórico de Conversas">
          <div className="flex justify-between flex h-[60px] items-center px-3">
            <button 
              onClick={onToggle} 
              className="h-10 rounded-lg px-2 text-token-text-secondary hover:bg-token-sidebar-surface-secondary"
              aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            >
              {isOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
            </button>
          </div>

          {isOpen && (
            <div className="flex-col flex-1 transition-opacity duration-500 relative overflow-y-auto">
              <div className="bg-token-sidebar-surface-primary">
                <div className="flex flex-col gap-2 px-2 py-2">
                  <div 
                    className={cn(
                      "group flex h-10 items-center gap-2.5 rounded-lg px-2 hover:bg-token-sidebar-surface-secondary cursor-pointer",
                      currentPath === '/livros-da-biblia' && "bg-token-sidebar-surface-secondary"
                    )}
                    onClick={goToLivrosDaBiblia}
                  >
                    <div className="h-6 w-6 flex items-center justify-center">
                      <Globe className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Livros da Bíblia</span>
                  </div>
                </div>

                <div className="mt-4">
                  <ChatHistoryList 
                    chatHistory={timeframes} 
                    onChatSelect={onChatSelect}
                    currentPath={currentPath}
                  />
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>
      
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30" 
          onClick={onToggle} 
          aria-hidden="true" 
        />
      )}
    </>
  );
};

export default Sidebar;
