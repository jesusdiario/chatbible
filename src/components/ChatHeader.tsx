
import { ChevronDown } from "lucide-react";

interface ChatHeaderProps {
  isSidebarOpen?: boolean;
}

const ChatHeader = ({ isSidebarOpen = true }: ChatHeaderProps) => {
  return (
    <div className="fixed top-0 z-30 w-full border-b border-white/20 bg-chatgpt-main/95 backdrop-blur">
      <div className="flex h-[60px] items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${!isSidebarOpen ? 'ml-24' : ''}`}>BibleGPT</span>
          <ChevronDown className="h-4 w-4" />
        </div>
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
          <img 
            src="/lovable-uploads/b7516a63-b1e6-46bc-93c9-927bf0c2accf.png" 
            alt="BibleGPT Logo" 
            className="h-8 w-8 object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
