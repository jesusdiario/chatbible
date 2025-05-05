
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useNavigate } from 'react-router-dom';
import { Verse, BibleTranslation } from '../services/bibleService';
import { BibleButton } from '../hooks/useVerseSelection';
import { Button } from './ui/button';
import { Loader2, Share2, Image, Copy, Save, BookOpen, PenSquare, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface VersesSelectionModalProps {
  open: boolean;
  onClose: () => void;
  verseReference: string;
  selectedVerses: Verse[];
  currentTranslation: BibleTranslation;
  buttons: BibleButton[];
  isLoadingButtons: boolean;
  getSelectedVersesText: (translation: string) => string;
  clearSelection?: () => void;
}

export const VersesSelectionModal: React.FC<VersesSelectionModalProps> = ({
  open,
  onClose,
  verseReference,
  selectedVerses,
  currentTranslation,
  buttons,
  isLoadingButtons,
  getSelectedVersesText,
  clearSelection
}) => {
  const navigate = useNavigate();

  // Escolhe o ícone certo para o botão baseado no nome do ícone
  const getButtonIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'share':
        return <Share2 className="w-5 h-5" />;
      case 'image':
        return <Image className="w-5 h-5" />;
      case 'copy':
        return <Copy className="w-5 h-5" />;
      case 'save':
        return <Save className="w-5 h-5" />;
      case 'annotation':
      case 'book-open':
        return <BookOpen className="w-5 h-5" />;
      case 'pray':
      case 'pen-square':
        return <PenSquare className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  // Manipula clique em um botão de ação
  const handleButtonClick = (button: BibleButton) => {
    const versesText = getSelectedVersesText(currentTranslation);
    // Se for copiar, copiamos o texto para a área de transferência
    if (button.button_name.toLowerCase().includes('copiar')) {
      navigator.clipboard.writeText(versesText);
      toast({
        title: "Copiado!",
        description: `${verseReference} foi copiado para a área de transferência.`,
      });
      onClose();
      return;
    }

    // Caso contrário, navegamos para o chat com o prompt
    const bookSlug = selectedVerses[0]?.book_slug || 'genesis';
    
    // Constrói o estado inicial para passar para a página de chat
    const initialState = {
      initialPrompt: versesText,  // O texto dos versículos será a mensagem visível
      systemPrompt: button.prompt_ai, // O prompt da AI fica "nos bastidores"
    };
    
    // Navega para o chat do livro específico
    navigate(`/livros-da-biblia/${bookSlug}`, { state: initialState });
    onClose();
  };

  // Função para copiar os versículos
  const handleCopyVerses = () => {
    const versesText = getSelectedVersesText(currentTranslation);
    navigator.clipboard.writeText(versesText);
    toast({
      title: "Copiado!",
      description: `${verseReference} foi copiado para a área de transferência.`,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">{verseReference}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {isLoadingButtons ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {buttons.map(button => (
                <Button
                  key={button.id}
                  variant="outline"
                  className="flex items-center justify-center gap-2 h-14"
                  onClick={() => handleButtonClick(button)}
                >
                  {getButtonIcon(button.button_icon)}
                  <span>{button.button_name}</span>
                </Button>
              ))}
              
              {/* Botão de copiar sempre presente */}
              {!buttons.some(b => b.button_name.toLowerCase().includes('copiar')) && (
                <Button
                  variant="outline"
                  className="flex items-center justify-center gap-2 h-14"
                  onClick={handleCopyVerses}
                >
                  <Copy className="w-5 h-5" />
                  <span>Copiar</span>
                </Button>
              )}
              
              {/* Botão para limpar seleção */}
              {clearSelection && (
                <Button
                  variant="outline"
                  className="flex items-center justify-center gap-2 h-14 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={clearSelection}
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Limpar seleção</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};