import { Menu, Globe, ChevronDown, Key, PlusCircle, X, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { ChatHistory, categorizeChatHistory } from "@/types/chat";
import { useNavigate } from "react-router-dom";
import SubscriptionModal from "@/components/SubscriptionModal";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onApiKeyChange: (apiKey: string) => void;
  onChatSelect?: (chatId: string) => void;
  chatHistory?: ChatHistory[];
  currentPath?: string;
}

const Sidebar = ({
  isOpen,
  onToggle,
  onApiKeyChange,
  onChatSelect,
  chatHistory = [],
  currentPath
}: SidebarProps) => {
  const [apiKey, setApiKey] = useState("");
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const navigate = useNavigate();

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    onApiKeyChange(newApiKey);
  };

  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

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
      <div className={cn("fixed top-0 left-0 z-40 h-screen transition-all duration-300", "bg-chatgpt-sidebar", isOpen ? "w-full md:w-64" : "w-0")}>
        <nav className="flex h-full w-full flex-col px-3" aria-label="Histórico de Conversas">
          <div className="flex justify-between flex h-[60px] items-center">
            <button onClick={onToggle} className="h-10 rounded-lg px-2 text-token-text-secondary hover:bg-token-sidebar-surface-secondary">
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <div className="flex-col flex-1 transition-opacity duration-500 relative -mr-2 pr-2 overflow-y-auto">
            {isOpen && <div className="bg-token-sidebar-surface-primary pt-0">
                <div className="flex flex-col gap-2 px-2 py-2">
                  <div className="group flex h-10 items-center gap-2.5 rounded-lg px-2 hover:bg-token-sidebar-surface-secondary cursor-pointer" onClick={() => onChatSelect && onChatSelect('new')}>
                    <div className="h-6 w-6 flex items-center justify-center">
                      <PlusCircle className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Nova conversa</span>
                  </div>
                  <div className="group flex h-10 items-center gap-2.5 rounded-lg px-2 hover:bg-token-sidebar-surface-secondary cursor-pointer" onClick={goToLivrosDaBiblia}>
                    <div className="h-6 w-6 flex items-center justify-center">
                      <Globe className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Livros da Bíblia</span>
                  </div>
                </div>
                {timeframes && timeframes.length > 0 ? (
                  <div className="mt-4 flex flex-col gap-4">
                    {timeframes.map(timeframe => (
                      <div key={timeframe.title}>
                        <div className="px-3 py-2 text-xs text-gray-500">{timeframe.title}</div>
                        {timeframe.items.map(item => (
                          <div 
                            key={item.id} 
                            className={cn(
                              "group flex h-10 items-center gap-2.5 rounded-lg px-2 hover:bg-token-sidebar-surface-secondary cursor-pointer",
                              currentPath?.includes(item.slug || '') && "bg-token-sidebar-surface-secondary"
                            )}
                            onClick={() => handleChatClick(item.id, item.slug || '', item.book_slug)}
                          >
                            <div className="h-6 w-6 flex items-center justify-center">
                              <MessageSquare className="h-4 w-4" />
                            </div>
                            <span className="text-sm truncate">{item.title}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 px-3 py-2 text-xs text-gray-500">
                    Nenhuma conversa recente
                  </div>
                )}
              </div>}
          </div>

          {isOpen && <div className="flex flex-col py-2 border-t border-white/20 bg-chatgpt-sidebar">
              <button className="group flex gap-2 p-2.5 text-sm items-start hover:bg-token-sidebar-surface-secondary rounded-lg px-2 text-left w-full min-w-[200px]" onClick={() => setShowSubscriptionModal(true)}>
                <span className="flex w-full flex-row flex-wrap-reverse justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-token-border-light">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-sm">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12.5001 3.44338C12.1907 3.26474 11.8095 3.26474 11.5001 3.44338L4.83984 7.28868C4.53044 7.46731 4.33984 7.79744 4.33984 8.1547V15.8453C4.33984 16.2026 4.53044 16.5327 4.83984 16.7113L11.5001 20.5566C11.8095 20.7353 12.1907 20.7353 12.5001 20.5566L19.1604 16.7113C19.4698 16.5327 19.6604 16.2026 19.6604 15.8453V8.1547C19.6604 7.79744 19.4698 7.46731 19.1604 7.28868L12.5001 3.44338Z" fill="currentColor" />
                      </svg>
                    </span>
                    <div className="flex flex-col">
                      <span>Atualizar plano</span>
                      <span className="line-clamp-1 text-xs text-token-text-tertiary">Libere + Mensagens</span>
                    </div>
                  </div>
                </span>
              </button>
            </div>}
        </nav>
      </div>
      
      {isOpen && <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={onToggle} aria-hidden="true" />}
      
      <SubscriptionModal isOpen={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} />
    </>;
};

export default Sidebar;
