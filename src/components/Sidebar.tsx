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
  onToggle
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
          // Try to fetch the profile data directly from user_profiles table
          const { data: profileData, error } = await supabase
            .from('user_profiles')
            .select('display_name, avatar_url')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error('Error fetching profile:', error);
            // Provide default values if there's an error
            setUserProfile({
              name: session.user.email?.split('@')[0] || 'Usuário',
              avatar_url: null
            });
            return;
          }
          
          // Check if profileData exists and use it
          if (profileData) {
            setUserProfile({
              name: profileData.display_name || session.user.email?.split('@')[0] || 'Usuário',
              avatar_url: profileData.avatar_url
            });
          } else {
            // Fallback if no profile data found
            setUserProfile({
              name: session.user.email?.split('@')[0] || 'Usuário',
              avatar_url: null
            });
          }
        }
      } catch (error) {
        console.error('Error in fetchUserProfile:', error);
        // Fallback for any unexpected errors
        setUserProfile({
          name: 'Usuário',
          avatar_url: null
        });
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
              <NavigationSection />
              
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
