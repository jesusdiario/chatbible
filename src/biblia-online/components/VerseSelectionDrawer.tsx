
import React from 'react';
import { Verse, BibleTranslation } from '../services/bibleService';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { BibleButton } from '../hooks/useVerseSelection';
import { useNavigate } from 'react-router-dom';

interface VerseSelectionDrawerProps {
  open: boolean;
  onClose: () => void;
  verseReference: string;
  selectedVerses: Verse[];
  currentTranslation: BibleTranslation;
  buttons: BibleButton[];
  isLoadingButtons: boolean;
  getSelectedVersesText: (translation: string) => string;
}

export const VerseSelectionDrawer: React.FC<VerseSelectionDrawerProps> = ({
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
  // Recupera o texto completo dos versículos para uso nos botões
  const versesText = getSelectedVersesText(currentTranslation);

  // Se não estiver aberto, não renderize nada
  if (!open) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 rounded-t-xl shadow-lg transform transition-transform duration-300 z-50">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">Versículos Selecionados</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </Button>
        </div>
        
        {verseReference && (
          <div className="mb-4">
            <p className="text-blue-600 font-bold">{verseReference}</p>
          </div>
        )}

        {isLoadingButtons ? (
          <div className="flex justify-center my-4">
            <p>Carregando opções...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 max-h-40 overflow-y-auto">
            {buttons.map(button => (
              <Button
                key={button.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  console.log('Navegando para chat com:', button.slug);
                  navigate(`/chat/${button.slug}?reference=${encodeURIComponent(verseReference)}&text=${encodeURIComponent(versesText)}`);
                }}
              >
                {button.button_name}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
