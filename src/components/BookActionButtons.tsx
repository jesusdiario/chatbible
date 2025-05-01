
import React, { useContext, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useMessageCount } from '@/hooks/useMessageCount';
import { ChatContext } from './ActionButtons';
import { Card } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { useBibleSuggestions } from '@/hooks/useBibleSuggestions';

type ActionButtonsProps = {
  book?: string;
  bookSlug: string;
  className?: string;
  audioId?: string;
  onAudioClick?: () => void;
  hasAudio?: boolean;
  displayInModal?: boolean;
};

const BookActionButtons = ({
  book,
  bookSlug,
  className,
  audioId,
  onAudioClick,
  hasAudio = false,
  displayInModal = false,
}: ActionButtonsProps) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { increment } = useMessageCount();
  const { sendMessage } = useContext(ChatContext);
  const { data: suggestions, isLoading } = useBibleSuggestions(bookSlug);
  
  // Handle action click
  const handleActionClick = async (action: string) => {
    // Close menu after selection
    setIsMenuOpen(false);
    
    // Track which action was taken
    try {
      // Try to increment message count first
      await increment();
      
      // If we get here, increment did not throw an error, so proceed with navigation
      if (action === 'summary') {
        navigate(`/livros-da-biblia/${bookSlug}/leitura`);
      } else if (action === 'characters') {
        navigate(`/livros-da-biblia/${bookSlug}/personagens`);
      } else if (action === 'themes') {
        navigate(`/livros-da-biblia/${bookSlug}/temas`);
      } else if (action === 'lessons') {
        navigate(`/livros-da-biblia/${bookSlug}/licoes`);
      }
    } catch (error) {
      console.error('Error handling button click:', error);
    }
  };

  // Handle sending a suggestion
  const handleSuggestionClick = (userMessage: string, promptOverride?: string) => {
    if (sendMessage) {
      sendMessage(userMessage, promptOverride);
    }
  };

  // If we're supposed to display in a modal, render suggestions from the database
  if (displayInModal) {
    if (isLoading) {
      return <div className="text-center p-4">Carregando sugestões...</div>;
    }

    if (!suggestions || suggestions.length === 0) {
      // If no suggestions are available, show default buttons
      return (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button
            variant="outline"
            className="flex items-center justify-between w-full p-4"
            onClick={() => handleActionClick('summary')}
          >
            <span className="text-[14px] font-medium">Ver Resumo</span>
          </Button>
          <Button
            variant="outline" 
            className="flex items-center justify-between w-full p-4"
            onClick={() => handleActionClick('characters')}
          >
            <span className="text-[14px] font-medium">Ver Personagens</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-between w-full p-4"
            onClick={() => handleActionClick('themes')}
          >
            <span className="text-[14px] font-medium">Ver Temas</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-between w-full p-4"
            onClick={() => handleActionClick('lessons')}
          >
            <span className="text-[14px] font-medium">Ver Lições</span>
          </Button>
        </div>
      );
    }

    // If we have suggestions from the database, display them
    return (
      <div className="grid grid-cols-2 gap-4 mt-4">
        {suggestions.map((suggestion) => (
          <Card
            key={suggestion.id}
            className="flex flex-col items-center p-4 cursor-pointer border hover:border-[#4483f4] transition-all"
            onClick={() => handleSuggestionClick(suggestion.user_message, suggestion.prompt_override)}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[14px] font-medium">{suggestion.label}</span>
              <Send className="h-4 w-4 text-[#4483f4]" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={className} aria-label="Abrir menu de ações">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleActionClick('summary')}>
          Ver Resumo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleActionClick('characters')}>
          Ver Personagens
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleActionClick('themes')}>
          Ver Temas
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleActionClick('lessons')}>
          Ver Lições
        </DropdownMenuItem>
        {hasAudio && audioId && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onAudioClick}>
              Ouvir Audio
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BookActionButtons;
