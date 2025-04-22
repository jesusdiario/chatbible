import React, { createContext } from "react";
import { BookOpen, FileText, MessageSquare, HelpCircle } from "lucide-react";

type SendMessageFunction = (message: string, promptOverride?: string) => void;

interface ChatContextProps {
  sendMessage: SendMessageFunction | null;
}

export const ChatContext = createContext<ChatContextProps>({
  sendMessage: null,
});

interface ActionButtonsProps {
  bookSlug?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = () => {
  const { sendMessage } = React.useContext(ChatContext);

  const handleAskAboutBook = () => {
    if (sendMessage) {
      sendMessage("Me fale mais sobre este livro.");
    }
  };

  const handleSummarizeBook = () => {
    if (sendMessage) {
      sendMessage("Resuma este livro.");
    }
  };

  const handleExplainConcepts = () => {
    if (sendMessage) {
      sendMessage("Explique os principais conceitos deste livro.");
    }
  };

  const handleGetHelp = () => {
    if (sendMessage) {
      sendMessage("Preciso de ajuda para entender este livro.");
    }
  };
  
  return (
    <div>
      <div className="flex gap-2 flex-wrap justify-center mt-4">
        <button 
          className="relative flex h-[42px] items-center gap-1.5 rounded-full border border-[#383737] px-3 py-2 text-start text-[13px] shadow-xxs transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"
          onClick={handleAskAboutBook}
        >
          <BookOpen className="h-4 w-4 text-green-400" />
          Me fale mais sobre este livro
        </button>
        <button 
          className="relative flex h-[42px] items-center gap-1.5 rounded-full border border-[#383737] px-3 py-2 text-start text-[13px] shadow-xxs transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"
          onClick={handleSummarizeBook}
        >
          <FileText className="h-4 w-4 text-green-400" />
          Resuma este livro
        </button>
        <button 
          className="relative flex h-[42px] items-center gap-1.5 rounded-full border border-[#383737] px-3 py-2 text-start text-[13px] shadow-xxs transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"
          onClick={handleExplainConcepts}
        >
          <MessageSquare className="h-4 w-4 text-green-400" />
          Explique os principais conceitos
        </button>
        <button 
          className="relative flex h-[42px] items-center gap-1.5 rounded-full border border-[#383737] px-3 py-2 text-start text-[13px] shadow-xxs transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"
          onClick={handleGetHelp}
        >
          <HelpCircle className="h-4 w-4 text-green-400" />
          Preciso de ajuda
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;
