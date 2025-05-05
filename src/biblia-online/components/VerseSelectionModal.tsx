
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Verse } from '@/types/biblia';
import { BibleButton } from '../types/buttons';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import * as Icons from 'lucide-react';

interface VerseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVerses: Verse[];
  formattedVerses: string;
  buttons: BibleButton[];
  isLoading: boolean;
}

// Helper function to dynamically import Lucide icons
const DynamicIcon = ({ name }: { name: string }) => {
  const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
  return <IconComponent className="h-4 w-4 mr-2" />;
};

export const VerseSelectionModal: React.FC<VerseSelectionModalProps> = ({
  isOpen,
  onClose,
  selectedVerses,
  formattedVerses,
  buttons,
  isLoading
}) => {
  const navigate = useNavigate();
  
  if (!isOpen) return null;
  
  // Get the full text of all selected verses
  const getSelectedVersesText = () => {
    return selectedVerses.map(verse => {
      const text = verse.text_naa || verse.text_nvi || verse.text_acf || 
                 verse.text_ara || verse.text_arc || verse.text_ntlh || 
                 verse.text_nvt || '';
      return `${verse.book_name} ${verse.chapter}:${verse.verse} - ${text}`;
    }).join('\n\n');
  };
  
  const handleButtonClick = (button: BibleButton) => {
    // Replace placeholder with actual verses
    const fullText = getSelectedVersesText();
    let prompt = button.prompt_ai.replace('{verses}', formattedVerses);
    
    // If button is not for saving or copying, navigate to chat
    if (button.slug !== 'salvar' && button.slug !== 'copiar') {
      navigate(`/livros-da-biblia/${selectedVerses[0]?.book_slug || 'genesis'}`, {
        state: {
          initialPrompt: `${prompt}\n\n${fullText}`
        }
      });
      onClose();
    } else if (button.slug === 'copiar') {
      // Handle copy operation
      navigator.clipboard.writeText(`${formattedVerses}\n\n${fullText}`)
        .then(() => {
          alert('Versículos copiados para a área de transferência!');
          onClose();
        })
        .catch(err => {
          console.error('Erro ao copiar texto:', err);
          alert('Não foi possível copiar o texto.');
        });
    }
    // Additional logic for 'salvar' can be added later
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg rounded-t-lg z-50 border-t border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Versículos Selecionados</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="mb-4">
        <p className="font-medium text-blue-600">{formattedVerses}</p>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {isLoading ? (
          <div className="col-span-4 text-center py-2">
            Carregando ações...
          </div>
        ) : (
          buttons.map(button => (
            <Button 
              key={button.id} 
              variant="outline"
              className="flex items-center justify-center"
              onClick={() => handleButtonClick(button)}
            >
              <DynamicIcon name={button.button_icon} />
              {button.button_name}
            </Button>
          ))
        )}
      </div>
    </div>
  );
};
