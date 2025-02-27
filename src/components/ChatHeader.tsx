
import { Menu, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewChat?: () => void;
}

const ChatHeader = ({
  isSidebarOpen,
  onToggleSidebar,
  onNewChat
}: ChatHeaderProps) => {
  return (
    <header className="fixed top-0 z-30 w-full border-b border-gray-200">
      <div className="flex h-[60px] items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {!isSidebarOpen && (
            <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="text-xl font-semibold">BibleGPT</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="hidden sm:inline-flex" onClick={onNewChat}>
            Nova Conversa
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
