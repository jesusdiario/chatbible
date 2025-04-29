
import { Search, X, Book, Plus, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ChatHistory, categorizeChatHistory } from "@/types/chat";
import { useNavigate } from "react-router-dom";
import SubscriptionModal from "@/components/SubscriptionModal";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onChatSelect?: (chatId: string) => void;
  chatHistory?: ChatHistory[];
  currentPath?: string;
  onApiKeyChange?: (key: string) => void;
}

const Sidebar = ({
  isOpen,
  onToggle,
  onChatSelect,
  chatHistory = [],
  currentPath,
  onApiKeyChange
}: SidebarProps) => {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<{
    name: string;
    avatar_url: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (session?.user) {
        const {
          data: profileData,
          error
        } = await supabase.from('user_profiles').select('display_name').eq('id', session.user.id).single();
        if (profileData) {
          setUserProfile({
            name: profileData.display_name || session.user.email?.split('@')[0] || 'Usuário',
            avatar_url: null // Since avatar_url column doesn't exist yet
          });
        } else {
          setUserProfile({
            name: session.user.email?.split('@')[0] || 'Usuário',
            avatar_url: null
          });
        }
      }
    };
    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen]);

  const goToLivrosDaBiblia = () => {
    navigate('/livros-da-biblia');
    if (window.innerWidth < 768) {
      onToggle();
    }
  };
  
  const goToHistory = () => {
    navigate('/history');
    if (window.innerWidth < 768) {
      onToggle();
    }
  };

  const goToProfile = () => {
    navigate('/profile');
    if (window.innerWidth < 768) {
      onToggle();
    }
  };

  return <>
      <div className={cn("fixed top-0 left-0 z-40 h-screen transition-all duration-300", "bg-white border-r", isOpen ? "w-full md:w-64" : "w-0")}>
        <nav className="flex h-full w-full flex-col p-4" aria-label="Navegação Principal">
          <div className="flex justify-between items-center mb-6 mt-2">
            {/* Removed duplicate menu toggle button */}
          </div>

          {isOpen && <>
              <div className="flex gap-2 mb-6">
                <Button onClick={() => navigate('/chat/new')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="mr-2 h-4 w-4" /> New chat
                </Button>
                <Button variant="outline" size="icon" className="rounded-full" onClick={() => console.log('Search clicked')}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Main Navigation items */}
              <div className="mb-6">
                <span className="text-sm text-gray-500 mb-2 block">Navegação</span>
                <button onClick={goToLivrosDaBiblia} className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg", currentPath === '/livros-da-biblia' ? "bg-gray-100" : "hover:bg-gray-50")}>
                  <Book className="h-5 w-5 text-gray-500" />
                  <span>Livros da Bíblia</span>
                </button>
                <button onClick={goToHistory} className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg", currentPath === '/history' ? "bg-gray-100" : "hover:bg-gray-50")}>
                  <History className="h-5 w-5 text-gray-500" />
                  <span>Histórico de Conversas</span>
                </button>
              </div>

              <div className="flex-1"></div>

              {/* User Profile Section - Added before subscription */}
              {userProfile && <div className="mb-4 border-t pt-4">
                  <button className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50" onClick={goToProfile}>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userProfile.avatar_url || undefined} />
                      <AvatarFallback>{userProfile.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium">{userProfile.name}</p>
                      <p className="text-xs text-gray-500">Ver perfil</p>
                    </div>
                  </button>
                </div>}

              {/* Subscription section */}
              <div className="mt-auto border-t pt-3">
                <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100" onClick={() => setShowSubscriptionModal(true)}>
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs">UP</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">Upgrade Pro</div>
                    <div className="text-xs text-gray-500">Libere + Mensagens</div>
                  </div>
                </button>
              </div>
            </>}
        </nav>
      </div>
      
      {isOpen && <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={onToggle} aria-hidden="true" />}
      
      <SubscriptionModal isOpen={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} />
    </>;
};

export default Sidebar;
