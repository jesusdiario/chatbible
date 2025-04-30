
import React from 'react';
import ChatInput from './ChatInput';
import MessageList from './MessageList';
import EmptyChatState from './EmptyChatState';
import { Message } from '@/types/chat';
import { useTranslation } from 'react-i18next';

interface BookChatProps {
  title: string;
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  bookSlug?: string;
  onSendMessage: (content: string) => void;
  loadingStage?: string | null;
}

const BookChat: React.FC<BookChatProps> = ({
  title,
  messages,
  isLoading,
  isTyping,
  bookSlug,
  onSendMessage,
  loadingStage
}) => {
  const { t } = useTranslation();
  
  // Get translated loading stage if available
  const getTranslatedLoadingStage = () => {
    if (!loadingStage) return null;
    
    // Map loading stage to translation key
    const stageMap: Record<string, string> = {
      "Aguarde...": "loading.stage1",
      "Consultando a Bíblia...": "loading.stage2",
      "Sola Scriptura...": "loading.stage3",
      "Sola Fide...": "loading.stage4",
      "Sola Gratia...": "loading.stage5",
      "Solus Christus...": "loading.stage6",
      "Soli Deo Gloria...": "loading.stage7",
      "Revisão teológica...": "loading.stage8",
      "Concluído!": "loading.stage9"
    };
    
    // Find the translation key for the current loading stage
    for (const [stage, key] of Object.entries(stageMap)) {
      if (loadingStage.includes(stage)) {
        return t(key);
      }
    }
    
    // Fallback to original loading stage if no translation is found
    return loadingStage;
  };
  
  return (
    <div className={`flex h-full flex-col ${messages.length === 0 ? 'items-center justify-center' : 'justify-between'} pt-[60px] pb-4`}>
      {messages.length === 0 ? (
        <EmptyChatState
          title={title}
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          bookSlug={bookSlug}
        />
      ) : (
        <>
          <MessageList 
            messages={messages} 
            isTyping={isTyping} 
            loadingStage={getTranslatedLoadingStage()}
            disableAutoScroll={true}
          />
          <div className="w-full max-w-3xl mx-auto px-4 py-2">
            <ChatInput 
              onSend={onSendMessage} 
              isLoading={isLoading}
              bookSlug={bookSlug}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default BookChat;
