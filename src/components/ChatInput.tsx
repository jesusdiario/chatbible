
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BookActionButtons from '@/components/BookActionButtons';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  bookSlug?: string;
}

const ChatInput = ({ onSend, isLoading, bookSlug }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Format book name to display with first letter capitalized
  const formattedBookName = bookSlug 
    ? bookSlug.charAt(0).toUpperCase() + bookSlug.slice(1).replace(/-/g, ' ') 
    : t('bible.explore');

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

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="flex items-center gap-2 rounded-[9999px] bg-white shadow-md p-3">
          {/* Add button */}
          <button 
            type="button"
            onClick={handleAddClick}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            aria-label={t('chat.addChat')}
          >
            <Plus className="h-5 w-5 text-gray-500" />
          </button>
          
          {/* Ready Questions button */}
          <button
            type="button"
            onClick={handleQuestionsClick}
            className="text-sm px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-100 text-[13px]"
          >
            {t('chat.readyQuestions')}
          </button>
          
          {/* Current Book button */}
          <button
            type="button"
            onClick={handleBookClick}
            className="text-sm px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-100 text-[13px]"
          >
            {formattedBookName}
          </button>
          
          {/* Message Input */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={bookSlug ? t('chat.askAboutBook', { book: formattedBookName }) : t('chat.askAboutBible')}
            className="flex-grow resize-none overflow-hidden text-base px-3 py-2 focus:outline-none min-h-[24px]"
            style={{ fontSize: '16px' }}
            rows={1}
            disabled={isLoading}
          />
          
          {/* Send button */}
          <button 
            type="submit" 
            disabled={!message.trim() || isLoading}
            className={`h-8 w-8 flex items-center justify-center rounded-full ${
              message.trim() ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
            }`}
            aria-label={t('chat.send')}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
      
      {/* Disclaimer text */}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-400">{t('chat.disclaimer')}</p>
      </div>
      
      {/* Questions Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('chat.readyQuestions')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {bookSlug && (
              <BookActionButtons bookSlug={bookSlug} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatInput;
