
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Book } from 'lucide-react';
import { ChatContext } from './ActionButtons';
import ActionButtons from './ActionButtons';

interface EmptyChatStateProps {
  title: string;
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  bookSlug?: string;
  isDevocional?: boolean;
}

const EmptyChatState: React.FC<EmptyChatStateProps> = ({
  title,
  onSendMessage,
  isLoading = false,
  bookSlug,
  isDevocional = false
}) => {
  const { t } = useTranslation();

  // Custom text specifically for Devocional Diário
  const placeholderText = isDevocional
    ? "Devocional diário do versículo..."
    : t('chat.askAboutBook', { book: title });

  return (
    <div className="max-w-3xl w-full mx-auto px-4 text-center">
      <div className="flex justify-center mb-6">
        <div className="h-16 w-16 rounded-full bg-[#F5F5F5] flex items-center justify-center">
          <Book className="h-8 w-8 text-gray-600" />
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-gray-600 mb-8">{t('chat.howCanIHelp')}</p>
      
      <ChatContext.Provider value={{ sendMessage: onSendMessage }}>
        <ActionButtons bookSlug={bookSlug} isDevocional={isDevocional} />
      </ChatContext.Provider>
      
      <div className="mt-8">
        <button 
          onClick={() => onSendMessage(placeholderText)}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
        >
          {placeholderText}
        </button>
      </div>
    </div>
  );
};

export default EmptyChatState;
