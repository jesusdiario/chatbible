
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSelectedVerse } from '@/contexts/SelectedVerseContext';
import { Button } from '@/components/ui/button';
import { BookmarkPlus, FilePlus, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface VerseActionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VerseActions: React.FC<VerseActionsProps> = ({ open, onOpenChange }) => {
  const { selectedVerse, setSelectedVerse } = useSelectedVerse();
  
  const handleCopyClick = async () => {
    if (!selectedVerse) return;
    
    try {
      const text = `${selectedVerse.bookName} ${selectedVerse.chapter}:${selectedVerse.verse} - ${selectedVerse.text}`;
      await navigator.clipboard.writeText(text);
      toast.success('Texto copiado com sucesso');
      onOpenChange(false);
    } catch (err) {
      console.error('Falha ao copiar texto:', err);
      toast.error('Falha ao copiar texto');
    }
  };

  const handleSave = () => {
    toast.success('Verso salvo com sucesso');
    onOpenChange(false);
  };

  const handleNote = () => {
    toast.success('Anotação iniciada');
    onOpenChange(false);
  };

  const handleHighlight = () => {
    toast.success('Verso destacado');
    onOpenChange(false);
  };
  
  if (!selectedVerse) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {selectedVerse.bookName} {selectedVerse.chapter}:{selectedVerse.verse}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-4 gap-4 mt-4">
          <Button 
            variant="outline"
            className="flex flex-col items-center justify-center p-4 h-auto"
            onClick={handleHighlight}
          >
            <div className="w-8 h-8 rounded-full bg-yellow-300 mb-2 flex items-center justify-center">
              <span className="text-xs">Aa</span>
            </div>
            <span className="text-xs">Destacar</span>
          </Button>
          
          <Button 
            variant="outline"
            className="flex flex-col items-center justify-center p-4 h-auto"
            onClick={handleSave}
          >
            <BookmarkPlus className="h-6 w-6 mb-2" />
            <span className="text-xs">Salvar</span>
          </Button>
          
          <Button 
            variant="outline"
            className="flex flex-col items-center justify-center p-4 h-auto"
            onClick={handleNote}
          >
            <FilePlus className="h-6 w-6 mb-2" />
            <span className="text-xs">Anotação</span>
          </Button>
          
          <Button 
            variant="outline"
            className="flex flex-col items-center justify-center p-4 h-auto"
            onClick={handleCopyClick}
          >
            <Copy className="h-6 w-6 mb-2" />
            <span className="text-xs">Copiar</span>
          </Button>
        </div>
        
        <div className="text-center text-sm text-gray-500 mt-4">
          Deslize para cima para ver mais
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerseActions;
