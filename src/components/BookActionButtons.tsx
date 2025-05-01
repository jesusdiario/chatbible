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
import { useRouter } from 'react-router-dom';
import { useMessageCount } from '@/hooks/useMessageCount';

type ActionButtonsProps = {
  book: string;
  bookSlug: string;
  className?: string;
  audioId?: string;
  onAudioClick?: () => void;
  hasAudio?: boolean;
};

const BookActionButtons = ({
  book,
  bookSlug,
  className,
  audioId,
  onAudioClick,
  hasAudio = false,
}: ActionButtonsProps) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { increment } = useMessageCount();
  
  // Handle action click
  const handleActionClick = async (action: string) => {
    // Close menu after selection
    setIsMenuOpen(false);
    
    // Track which action was taken
    try {
      // Try to increment message count first
      const canProceed = await increment();
      
      if (!canProceed) {
        // If incrementing failed (reached limit), return early
        return;
      }
      
      // If increment was successful, proceed with navigation
      if (action === 'summary') {
        router.push(`/livros-da-biblia/${bookSlug}/leitura`);
      } else if (action === 'characters') {
        router.push(`/livros-da-biblia/${bookSlug}/personagens`);
      } else if (action === 'themes') {
        router.push(`/livros-da-biblia/${bookSlug}/temas`);
      } else if (action === 'lessons') {
        router.push(`/livros-da-biblia/${bookSlug}/licoes`);
      }
    } catch (error) {
      console.error('Error handling button click:', error);
    }
  };

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
