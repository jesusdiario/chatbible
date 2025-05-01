
import React, { useState } from 'react';
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

type ActionButtonsProps = {
  book?: string;
  bookSlug: string;
  className?: string;
  audioId?: string;
  onAudioClick?: () => void;
  hasAudio?: boolean;
  displayInModal?: boolean; // Add this prop to match usage in ChatInput.tsx
};

const BookActionButtons = ({
  book,
  bookSlug,
  className,
  audioId,
  onAudioClick,
  hasAudio = false,
  displayInModal = false, // Add default value for the new prop
}: ActionButtonsProps) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { increment } = useMessageCount();
  
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

  // If we're supposed to display in a modal, render a different UI
  if (displayInModal) {
    return (
      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* Add common actions for all books when displayed in modal */}
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
