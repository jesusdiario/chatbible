
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  onNewChat?: () => void;
  onToggleSidebar?: () => void;
}

const ChatHeader = ({
  isSidebarOpen,
  onNewChat,
  onToggleSidebar
}: ChatHeaderProps) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="fixed top-0 z-30 w-full border-b border-gray-200">
      <div className="flex h-[60px] items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {!isSidebarOpen && (
            <Menu 
              className="h-5 w-5 cursor-pointer" 
              onClick={onToggleSidebar}
            />
          )}
          <div className="text-xl font-semibold px-[50px]">BibleGPT</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden sm:inline-flex" onClick={onNewChat}>
            Nova Conversa
          </Button>
          <Button variant="ghost" onClick={handleSignOut}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
