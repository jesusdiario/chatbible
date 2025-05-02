
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import SubscriptionModal from "@/components/SubscriptionModal";
import UserProfileSection from "./sidebar/UserProfileSection";
import SubscriptionSection from "./sidebar/SubscriptionSection";
import NavigationSection from "./sidebar/NavigationSection";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPath?: string;
}

const Sidebar = ({
  isOpen,
  onToggle,
  currentPath
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
          // Without relying on type-safety for the user_profiles table
          // Use RPC function instead which is safer
          const { data, error } = await supabase
            .rpc('get_user_profile', { user_id_param: session.user.id });
          
          if (error) {
            console.error('Error fetching profile:', error);
            setUserProfile({
              name: session.user.email?.split('@')[0] || 'Usuário',
              avatar_url: null
            });
            return;
          }
          
          if (data) {
            setUserProfile({
              name: data.display_name || session.user.email?.split('@')[0] || 'Usuário',
              avatar_url: data.avatar_url
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
        <nav className="flex h-full w-full flex-col p-4" aria-label="Menu Principal">
          {isOpen && <>
              {/* User Profile Section - Now at the top */}
              <UserProfileSection userProfile={userProfile} onToggle={onToggle} />
              
              {/* Navigation Menu Section */}
              <NavigationSection currentPath={currentPath} onToggle={onToggle} />
              
              <div className="flex-1"></div>
              
              {/* Subscription section - Kept at the bottom */}
              <SubscriptionSection onOpenSubscriptionModal={() => setShowSubscriptionModal(true)} />
            </>}
        </nav>
      </div>
      
      {isOpen && <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={onToggle} aria-hidden="true" />}
      
      <SubscriptionModal isOpen={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} />
    </>;
};

export default Sidebar;
