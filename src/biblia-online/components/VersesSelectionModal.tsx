
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Verse, BibleTranslation } from '../services/bibleService';
import { Loader2, Copy, Share2, X } from 'lucide-react';
import { BibleButton } from '../hooks/useVerseSelection';
import { useToast } from '@/hooks/use-toast';

interface VersesSelectionModalProps {
  open: boolean;
  onClose: () => void;
  clearSelection: () => void; // Nova prop para limpar seleção
  verseReference: string;
  selectedVerses: Verse[];
  currentTranslation: BibleTranslation;
  buttons: BibleButton[];
  isLoadingButtons: boolean;
  getSelectedVersesText: (translation: string) => string;
}

export const VersesSelectionModal: React.FC<VersesSelectionModalProps> = ({
  open,
  onClose,
  clearSelection,
  verseReference,
  selectedVerses,
  currentTranslation,
  buttons,
  isLoadingButtons,
  getSelectedVersesText
}) => {
  const { toast } = useToast();

  const handleCopy = () => {
    const text = getSelectedVersesText(currentTranslation);
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Copiado!",
          description: "Texto copiado para a área de transferência."
        });
      })
      .catch(err => {
        console.error('Erro ao copiar:', err);
        toast({
          title: "Erro",
          description: "Não foi possível copiar o texto.",
          variant: "destructive"
        });
      });
  };

  const handleShare = async () => {
    const text = getSelectedVersesText(currentTranslation);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${verseReference} | Bíblia`,
          text: text
        });
        
        toast({
          title: "Compartilhado!",
          description: "Conteúdo compartilhado com sucesso."
        });
      } catch (err) {
        console.error('Erro ao compartilhar:', err);
        
        // Ignora erros de cancelamento pelo usuário
        if (err.name !== 'AbortError') {
          toast({
            title: "Erro",
            description: "Não foi possível compartilhar o conteúdo.",
            variant: "destructive"
          });
        }
      }
    } else {
      // Fallback para dispositivos que não suportam a API Share
      handleCopy();
      toast({
        title: "Texto copiado!",
        description: "Compartilhamento não disponível neste dispositivo."
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Versículos selecionados</span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearSelection}
                title="Limpar seleção"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopy}
                title="Copiar texto"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShare}
                title="Compartilhar"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-lg font-medium text-center text-secondary-foreground mb-4">
          {verseReference}
        </div>
        
        <div className="text-sm p-4 bg-muted rounded-md max-h-48 overflow-auto">
          {getSelectedVersesText(currentTranslation)}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-center">
          {isLoadingButtons ? (
            <div className="flex justify-center py-4 w-full">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center">
              {buttons.map(button => (
                <Button 
                  key={button.id} 
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => {
                    console.log("Botão clicado:", button);
                    // Aqui você implementaria a ação do botão
                  }}
                >
                  <i className={`lucide lucide-${button.button_icon}`}></i>
                  {button.button_name}
                </Button>
              ))}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
