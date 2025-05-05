
import React, { useState } from 'react';
import { Verse, BibleTranslation } from '../services/bibleService';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { BibleButton } from '../hooks/useVerseSelection';
import { useNavigate } from 'react-router-dom';
import { sendChatMessage } from '@/services/chatService';
import { toast } from '@/hooks/use-toast';

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
  const [processingButton, setProcessingButton] = useState<string | null>(null);
  
  // Recupera o texto completo dos versículos para uso nos botões
  const versesText = getSelectedVersesText(currentTranslation);

  // Se não estiver aberto, não renderize nada
  if (!open) return null;

  const handleButtonClick = async (button: BibleButton) => {
    if (!button.prompt_ai) {
      toast({
        title: "Erro",
        description: "Este botão não possui um prompt associado.",
        variant: "destructive",
      });
      return;
    }

    setProcessingButton(button.id);
    
    try {
      // Monta a mensagem com o prompt do botão + texto dos versículos
      const prompt = `${button.prompt_ai}\n\n${verseReference}\n\n${versesText}`;
      
      // Chama o serviço para enviar a mensagem
      const result = await sendChatMessage(
        prompt,
        [], // mensagens vazias, pois é um novo chat
        undefined, // sem book específico
        null, // usuário atual (null passará o usuário da sessão)
        undefined, // slug undefined para criar novo chat
        undefined // sem prompt system override
      );
      
      // Redireciona para o chat criado
      if (result && result.slug) {
        navigate(`/chat/${result.slug}`);
        onClose(); // Fecha o drawer após redirecionar
      }
    } catch (error) {
      console.error("Erro ao processar ação bíblica:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua solicitação. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setProcessingButton(null);
    }
  };

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
                disabled={processingButton !== null}
                onClick={() => handleButtonClick(button)}
              >
                {processingButton === button.id ? (
                  <span>Processando...</span>
                ) : (
                  button.button_name
                )}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
