
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ChatHistory } from "@/types/chat";
import SubscriptionModal from "@/components/SubscriptionModal";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import UserProfileSection from "./sidebar/UserProfileSection";
import SubscriptionSection from "./sidebar/SubscriptionSection";
import NavigationSection from "./sidebar/NavigationSection";
import ChatHistorySection from "./sidebar/ChatHistorySection";

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
  const [userProfile, setUserProfile] = useState<{
    name: string;
    avatar_url: string | null;
  } | null>(null);
  const { subscribed } = useSubscription();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession();
        
        if (session?.user) {
          const {
            data: profileData,
            error
          } = await supabase
            .from('user_profiles')
            .select('display_name, avatar_url')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error('Error fetching profile:', error);
            setUserProfile({
              name: session.user.email?.split('@')[0] || 'Usuário',
              avatar_url: null
            });
            return;
          }
          
          if (profileData) {
            setUserProfile({
              name: profileData.display_name || session.user.email?.split('@')[0] || 'Usuário',
              avatar_url: profileData.avatar_url
            });
          } else {
            setUserProfile({
              name: session.user.email?.split('@')[0] || 'Usuário',
              avatar_url: null
            });
          }
        }
      } catch (error) {
        console.error('Error in fetchUserProfile:', error);
      }
    };
    
    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen]);

  return <>
      <div className={cn("fixed top-0 left-0 z-40 h-screen transition-all duration-300", "bg-white border-r", isOpen ? "w-full md:w-64" : "w-0")}>
        <nav className="flex h-full w-full flex-col p-4" aria-label="Navegação Principal">
          {isOpen && <>
              {/* Main Navigation items */}
              <NavigationSection currentPath={currentPath} onToggle={onToggle} />

              {/* Chat History Section */}
              <ChatHistorySection 
                chatHistory={chatHistory} 
                currentPath={currentPath} 
                onChatSelect={onChatSelect} 
                onToggle={onToggle}
                subscribed={subscribed}
              />

              <div className="flex-1"></div>

              {/* User Profile Section */}
              <UserProfileSection userProfile={userProfile} onToggle={onToggle} />

              {/* Subscription section */}
              <SubscriptionSection onOpenSubscriptionModal={() => setShowSubscriptionModal(true)} />
            </>}
        </nav>
      </div>
      
      {isOpen && <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={onToggle} aria-hidden="true" />}
      
      <SubscriptionModal isOpen={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} />
    </>;
};

export default Sidebar;
