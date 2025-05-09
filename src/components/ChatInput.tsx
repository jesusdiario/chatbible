
import React, { useState, useRef, useEffect, createContext } from 'react';
import { Home, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BookActionButtons from '@/components/BookActionButtons';
import { ChatContext } from './ActionButtons';

interface ChatInputProps {
  onSend: (message: string, promptOverride?: string) => void;
  isLoading?: boolean;
  bookSlug?: string;
  isDevocional?: boolean;
}

const ChatInput = ({
  onSend,
  isLoading,
  bookSlug,
  isDevocional = false
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Format book name to display with first letter capitalized
  const formattedBookName = bookSlug ? bookSlug.charAt(0).toUpperCase() + bookSlug.slice(1).replace(/-/g, ' ') : t('bible.explore');
  
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() || isLoading) return;

    // Send message
    onSend(message.trim());

    // Clear input
    setMessage('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height - necessary to shrink on backspace
      textarea.style.height = 'auto';
      // Set new height
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  // Adjust height when message changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  // Handle navigation to books page
  const handleAddClick = () => {
    navigate('/livros-da-biblia');
  };

  // Handle navigation to current book
  const handleBookClick = () => {
    if (bookSlug) {
      navigate(`/livros-da-biblia/${bookSlug}`);
    } else {
      navigate('/livros-da-biblia');
    }
  };

  // Toggle questions modal
  const handleQuestionsClick = () => {
    setIsModalOpen(true);
  };

  // Function to handle sending a message from BookActionButtons
  const handleSendMessage = (content: string, promptOverride?: string) => {
    onSend(content, promptOverride);
    setIsModalOpen(false); // Close the modal after sending
  };

  // Set placeholder text based on whether it's Devocional Diário or not
  const placeholderText = isDevocional
    ? "Devocional diário do versículo..."
    : bookSlug 
      ? t('chat.askAboutBook', { book: formattedBookName })
      : t('chat.askAboutBible');
  
  // Button text based on whether it's Devocional Diário or not
  const questionsButtonText = isDevocional
    ? "Temas para Devocionais"
    : t('chat.readyQuestions');

  return <div className="w-full">
      {/* Main input form */}
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="rounded-[24px] bg-white shadow-md p-4">
          {/* Message Input */}
          <textarea 
            ref={textareaRef} 
            value={message} 
            onChange={e => setMessage(e.target.value)} 
            onKeyDown={handleKeyDown} 
            placeholder={placeholderText}
            className="w-full resize-none overflow-hidden focus:outline-none min-h-[24px] mb-2" 
            style={{
              fontSize: '16px'
            }} 
            rows={1} 
            disabled={isLoading} 
          />
          
          {/* Buttons row below the textarea */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Home button (previously Add button) */}
            <button type="button" onClick={handleAddClick} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 border border-gray-200" aria-label={t('chat.addChat')}>
              <Home className="h-5 w-5 text-gray-500" />
            </button>
            
            {/* Ready Questions button */}
            <button type="button" onClick={handleQuestionsClick} className="text-sm px-4 py-1.5 rounded-[18px] border border-gray-200 hover:bg-gray-100 text-[13px]">
              {questionsButtonText}
            </button>
            
            {/* Send button - aligned to the right */}
            <button type="submit" disabled={!message.trim() || isLoading} className={`h-8 w-8 flex items-center justify-center rounded-full ml-auto ${message.trim() ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`} aria-label={t('chat.send')}>
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>
      
      {/* Disclaimer text */}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-400">{t('chat.disclaimer')}</p>
      </div>
      
      {/* Questions Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{questionsButtonText}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {bookSlug && <ChatContext.Provider value={{
            sendMessage: handleSendMessage
          }}>
                <BookActionButtons bookSlug={bookSlug} displayInModal={true} />
              </ChatContext.Provider>}
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};

export default ChatInput;
