
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  onNewChat?: () => void;
}

const ChatHeader = ({
  isSidebarOpen,
  onNewChat
}: ChatHeaderProps) => {
  return <header className="fixed top-0 z-30 w-full border-b border-gray-200">
      <div className="flex h-[60px] items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {!isSidebarOpen && <Menu className="h-5 w-5 cursor-pointer" />}
          <div className="text-xl font-semibold">BibleGPT</div>
        </div>
        <div>
          <Button variant="outline" className="hidden sm:inline-flex" onClick={onNewChat}>
            Nova Conversa
          </Button>
        </div>
      </div>
    </header>;
};

export default ChatHeader;
