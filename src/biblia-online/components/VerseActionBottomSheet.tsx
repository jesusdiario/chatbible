
import React from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Verse, BibleTranslation } from '../services/bibleService';
import { BibleButton } from '../hooks/useVerseSelection';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter
} from '@/components/ui/drawer';
import { useNavigate } from 'react-router-dom';

interface VerseActionBottomSheetProps {
  open: boolean;
  onClose: () => void;
  verseReference: string;
  selectedVerses: Verse[];
  currentTranslation: BibleTranslation;
  buttons: BibleButton[];
  isLoadingButtons: boolean;
  getSelectedVersesText: (translation: string) => string;
}

export const VerseActionBottomSheet: React.FC<VerseActionBottomSheetProps> = ({
  open,
  onClose,
  verseReference,
  selectedVerses,
  currentTranslation,
  buttons,
  isLoadingButtons,
  getSelectedVersesText
}) => {
  const navigate = useNavigate();
  
  // Manipular a cópia do texto para a área de transferência
  const handleCopyText = () => {
    const text = getSelectedVersesText(currentTranslation);
    navigator.clipboard.writeText(text)
      .then(() => {
        // Poderíamos adicionar um toast de confirmação aqui
        console.log('Texto copiado para a área de transferência');
      })
      .catch(err => {
        console.error('Erro ao copiar texto: ', err);
      });
  };
  
  // Manipular a navegação para a página de GPT específico
  const handleNavigateToGPT = (slug: string, promptTemplate: string) => {
    // Preparar o texto dos versículos
    const versesText = getSelectedVersesText(currentTranslation);
    
    // Construir o prompt completo
    const fullPrompt = `${promptTemplate}\n\n${versesText}`;
    
    // Navegar para a página do assistente com o prompt preenchido
    navigate(`/chat/${slug}`, { 
      state: { 
        initialPrompt: fullPrompt,
        source: 'bible_selection',
        reference: verseReference
      } 
    });
    
    // Fechar o drawer após a navegação
    onClose();
  };

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mt-2 mb-2" />
        
        <DrawerHeader className="text-left px-4">
          <DrawerTitle className="text-lg font-semibold">
            {verseReference}
          </DrawerTitle>
          <p className="text-sm text-gray-500 mt-1">
            Deslize para cima para ver mais opções
          </p>
        </DrawerHeader>
        
        <ScrollArea className="px-4 flex-1 max-h-[50vh]">
          <div className="mb-6 bg-gray-50 p-3 rounded-md text-gray-700 leading-relaxed">
            {getSelectedVersesText(currentTranslation)}
          </div>
          
          <div className="mb-8">
            <h3 className="font-medium text-sm text-gray-500 mb-3">AÇÕES RÁPIDAS</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={handleCopyText}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar texto
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => window.open(`https://www.bible.com/search/${encodeURIComponent(verseReference)}`, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir no Bible.com
              </Button>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="font-medium text-sm text-gray-500 mb-3">GERAR COM IA</h3>
            <div className="space-y-3">
              {isLoadingButtons ? (
                <p className="text-sm text-gray-500">Carregando opções...</p>
              ) : (
                buttons.map((button) => (
                  <Button
                    key={button.id}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleNavigateToGPT(button.slug, button.prompt_ai)}
                  >
                    {/* Você pode adicionar ícones dinâmicos aqui com base em button.button_icon */}
                    {button.button_name}
                  </Button>
                ))
              )}
            </div>
          </div>
        </ScrollArea>
        
        <DrawerFooter className="px-4 pt-2 pb-6">
          <Button 
            variant="default" 
            onClick={onClose}
            className="w-full"
          >
            Fechar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
