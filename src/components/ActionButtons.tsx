
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

const ActionButtons: React.FC<ActionButtonsProps> = ({ bookSlug }) => {
  const { sendMessage } = React.useContext(ChatContext);

  // Different messages based on book
  const getMessages = () => {
    if (bookSlug === 'devocional-diario') {
      return {
        aboutBook: "Me dê um devocional para hoje",
        summarize: "Como aplicar este versículo no meu dia?",
        explainConcepts: "Como desenvolver um hábito de meditação diária?",
        needHelp: "Preciso de ajuda para entender a importância de devocionais"
      };
    }
    
    // Default messages for other books
    return {
      aboutBook: "Me fale mais sobre este livro.",
      summarize: "Resuma este livro.",
      explainConcepts: "Explique os principais conceitos deste livro.",
      needHelp: "Preciso de ajuda para entender este livro."
    };
  };
  
  const messages = getMessages();

  const handleAskAboutBook = () => {
    if (sendMessage) {
      sendMessage(messages.aboutBook);
    }
  };

  const handleSummarizeBook = () => {
    if (sendMessage) {
      sendMessage(messages.summarize);
    }
  };

  const handleExplainConcepts = () => {
    if (sendMessage) {
      sendMessage(messages.explainConcepts);
    }
  };

  const handleGetHelp = () => {
    if (sendMessage) {
      sendMessage(messages.needHelp);
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
          {messages.aboutBook}
        </button>
        <button 
          className="relative flex h-[42px] items-center gap-1.5 rounded-full border border-[#383737] px-3 py-2 text-start text-[13px] shadow-xxs transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"
          onClick={handleSummarizeBook}
        >
          <FileText className="h-4 w-4 text-green-400" />
          {messages.summarize}
        </button>
        <button 
          className="relative flex h-[42px] items-center gap-1.5 rounded-full border border-[#383737] px-3 py-2 text-start text-[13px] shadow-xxs transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"
          onClick={handleExplainConcepts}
        >
          <MessageSquare className="h-4 w-4 text-green-400" />
          {messages.explainConcepts}
        </button>
        <button 
          className="relative flex h-[42px] items-center gap-1.5 rounded-full border border-[#383737] px-3 py-2 text-start text-[13px] shadow-xxs transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"
          onClick={handleGetHelp}
        >
          <HelpCircle className="h-4 w-4 text-green-400" />
          {messages.needHelp}
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;
