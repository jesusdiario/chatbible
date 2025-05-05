
import React, { useState } from 'react';
import { Verse, BibleTranslation } from '../services/bibleService';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import { BibleButton } from '../hooks/useVerseSelection';
import { sendChatMessage } from '@/services/chatService';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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
  const [loadingButtonId, setLoadingButtonId] = useState<string | null>(null);
  
  // Recupera o texto completo dos versículos para uso nos botões
  const versesText = getSelectedVersesText(currentTranslation);

  // Se não estiver aberto, não renderize nada
  if (!open) return null;

  // Função para lidar com o clique no botão
  const handleButtonClick = async (button: BibleButton) => {
    try {
      setLoadingButtonId(button.id);
      
      // Verificar se o usuário está logado
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        toast({
          title: "Atenção",
          description: "Você precisa estar logado para usar esta funcionalidade",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }
      
      // Montar o conteúdo da mensagem com a referência e o texto dos versículos
      const content = `${verseReference}\n\n${versesText}\n\n${button.prompt_ai || ''}`;
      
      // Enviar a mensagem usando o serviço de chat
      const result = await sendChatMessage(
        content,
        [], // mensagens iniciais vazias
        button.slug, // usar o slug do botão como book
        userId,
        undefined, // deixar o serviço gerar um novo slug de chat
        button.prompt_ai, // usar o prompt do botão
        undefined, // não precisamos de callback de chunks
        undefined // não precisamos de callback de estágio
      );
      
      // Navegar para a página de chat com o novo slug
      if (result && result.slug) {
        navigate(`/chat/${result.slug}`);
        onClose(); // Fechar o drawer após navegar
      }
    } catch (error) {
      console.error('Erro ao processar botão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua solicitação",
        variant: "destructive"
      });
    } finally {
      setLoadingButtonId(null);
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
                disabled={loadingButtonId === button.id}
                onClick={() => handleButtonClick(button)}
              >
                {loadingButtonId === button.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
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
