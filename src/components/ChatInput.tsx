
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Plus, Globe, BookOpen } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBibleBook } from '@/hooks/useBibleBook';
import { useTranslation } from 'react-i18next';
import BookSuggestionsModal from './BookSuggestionsModal';

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
  const { book } = useParams<{ book: string }>();
  const { bookDetails } = useBibleBook(book);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      handleSubmit(e);
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

  const navigateToBibleBooks = () => {
    navigate('/livros-da-biblia');
  };

  const navigateToBook = () => {
    if (book) {
      navigate(`/livros-da-biblia/${book}`);
    }
  };

  const openSuggestionsModal = () => {
    setShowSuggestionsModal(true);
  };

  const closeSuggestionsModal = () => {
    setShowSuggestionsModal(false);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Rounded chat container */}
      <div className="relative rounded-2xl shadow-sm border bg-white">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`${t('chat.askAbout')} ${bookDetails?.title || bookSlug || t('chat.bible')}...`}
          className="pr-10 resize-none min-h-[52px] max-h-[200px] overflow-y-auto text-base py-3 px-4 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={isLoading}
          rows={1}
        />
        
        {/* Button Group */}
        <div className="absolute left-3 bottom-3 flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full bg-transparent hover:bg-gray-100"
            onClick={navigateToBibleBooks}
          >
            <Plus className="h-5 w-5 text-gray-500" />
          </Button>
          
          <div className="h-6 border-l border-gray-200 mx-1"></div>
          
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-gray-500 hover:bg-gray-100 px-3 text-[13px] h-8 font-normal"
            onClick={openSuggestionsModal}
          >
            <Globe className="h-4 w-4 mr-2 text-gray-500" />
            {t('chat.readyQuestions')}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-gray-500 hover:bg-gray-100 px-3 text-[13px] h-8 font-normal"
            onClick={navigateToBook}
          >
            <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
            {bookDetails?.title || book || t('chat.bible')}
          </Button>
        </div>

        {/* Send Button */}
        <div className="absolute right-3 bottom-3">
          <Button 
            size="icon" 
            variant="ghost"
            className="h-8 w-8 rounded-full bg-transparent hover:bg-gray-100"
            type="submit" 
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? 
              <Loader2 className="h-5 w-5 text-gray-500 animate-spin" /> : 
              <Send className="h-5 w-5 text-gray-500" />
            }
          </Button>
        </div>
      </div>
      
      {/* Disclaimer text */}
      <div className="text-center text-xs text-gray-500 mt-2">
        {t('chat.disclaimer')}
      </div>

      {/* Suggestions Modal */}
      {showSuggestionsModal && book && (
        <BookSuggestionsModal
          bookSlug={book}
          isOpen={showSuggestionsModal}
          onClose={closeSuggestionsModal}
          onSelectSuggestion={(suggestion) => {
            onSend(suggestion);
            closeSuggestionsModal();
          }}
        />
      )}
    </div>
  );
};

export default ChatInput;
