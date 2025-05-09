
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
  isDevocional?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  bookSlug, 
  isDevocional = false 
}) => {
  const { sendMessage } = React.useContext(ChatContext);

  const handleAskAboutBook = () => {
    if (sendMessage) {
      if (isDevocional) {
        sendMessage("Qual o devocional de hoje?");
      } else {
        sendMessage("Me fale mais sobre este livro.");
      }
    }
  };

  const handleSummarizeBook = () => {
    if (sendMessage) {
      if (isDevocional) {
        sendMessage("Compartilhe um versículo para reflexão hoje.");
      } else {
        sendMessage("Resuma este livro.");
      }
    }
  };

  const handleExplainConcepts = () => {
    if (sendMessage) {
      if (isDevocional) {
        sendMessage("Sugira uma meditação para hoje.");
      } else {
        sendMessage("Explique os principais conceitos deste livro.");
      }
    }
  };

  const handleGetHelp = () => {
    if (sendMessage) {
      if (isDevocional) {
        sendMessage("Como aplicar este devocional na minha vida?");
      } else {
        sendMessage("Preciso de ajuda para entender este livro.");
      }
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
          {isDevocional ? "Qual o devocional de hoje?" : "Me fale mais sobre este livro"}
        </button>
        <button 
          className="relative flex h-[42px] items-center gap-1.5 rounded-full border border-[#383737] px-3 py-2 text-start text-[13px] shadow-xxs transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"
          onClick={handleSummarizeBook}
        >
          <FileText className="h-4 w-4 text-green-400" />
          {isDevocional ? "Compartilhe um versículo" : "Resuma este livro"}
        </button>
        <button 
          className="relative flex h-[42px] items-center gap-1.5 rounded-full border border-[#383737] px-3 py-2 text-start text-[13px] shadow-xxs transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"
          onClick={handleExplainConcepts}
        >
          <MessageSquare className="h-4 w-4 text-green-400" />
          {isDevocional ? "Sugira uma meditação" : "Explique os principais conceitos"}
        </button>
        <button 
          className="relative flex h-[42px] items-center gap-1.5 rounded-full border border-[#383737] px-3 py-2 text-start text-[13px] shadow-xxs transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"
          onClick={handleGetHelp}
        >
          <HelpCircle className="h-4 w-4 text-green-400" />
          {isDevocional ? "Como aplicar na minha vida?" : "Preciso de ajuda"}
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;
