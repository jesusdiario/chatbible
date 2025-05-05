
import React from 'react';
import { BibleButton } from '../hooks/useVerseSelection';
import { Loader2, X } from 'lucide-react';
import { sendChatMessage } from '@/services/chatService';
import { useNavigate } from 'react-router-dom';
import { Verse } from '../services/bibleService';

interface SelectedVersesBarProps {
  reference: string;              // Mateus 1:1‑2,4…
  selectedVerses: Verse[];
  buttons: BibleButton[];
  loading: boolean;
  onClear: () => void;
  getSelectedVersesText: (translation: string) => string;
}

const SelectedVersesBar: React.FC<SelectedVersesBarProps> = ({
  reference,
  selectedVerses,
  buttons,
  loading,
  onClear,
  getSelectedVersesText
}) => {
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = React.useState(false);
  
  // Função para lidar com ação do botão
  const handleAction = async (button: BibleButton) => {
    if (selectedVerses.length === 0) return;
    
    try {
      setActionLoading(true);
      
      // Obter o texto dos versículos
      const versesText = getSelectedVersesText('text_naa');
      
      // Construir a mensagem para enviar ao chat
      const promptText = button.prompt_ai
        .replace('{{reference}}', reference)
        .replace('{{verses}}', versesText);
      
      console.log('Enviando prompt:', promptText);
      
      // Chamar o serviço de chat
      const result = await sendChatMessage(
        promptText,
        [], // mensagens vazias para iniciar nova conversa
        undefined, // book não especificado
        undefined, // userId não especificado (será obtido pelo serviço)
        undefined, // slug não especificado (será gerado)
        undefined, // promptOverride não necessário
        undefined, // onChunk não necessário aqui
        (stage) => console.log('Loading stage:', stage) // log do estágio de carregamento
      );
      
      // Navegue para a página de chat com o slug gerado
      if (result && result.slug) {
        console.log('Chat criado com sucesso, navegando para:', result.slug);
        navigate(`/chat/${result.slug}`);
      } else {
        console.error('Erro: resposta não contém slug');
      }
    } catch (error) {
      console.error('Erro ao processar ação:', error);
      // Você pode adicionar um toast ou outro feedback visual aqui
    } finally {
      setActionLoading(false);
      onClear(); // limpa a seleção após a ação
    }
  };
  
  return (
    <aside
      className="fixed bottom-16 inset-x-0 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.08)] border-t
                 transition-transform duration-300 z-10"
    >
      <div className="max-w-2xl mx-auto px-4 py-3 flex flex-col gap-4">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Versículos selecionados:&nbsp;<span className="underline text-blue-600">{reference}</span>
          </span>

          <button
            onClick={onClear}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
            aria-label="Limpar seleção"
            disabled={actionLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Botões de ação */}
        {(loading || actionLoading) ? (
          <div className="flex justify-center py-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-gray-600">
              {actionLoading ? 'Processando...' : 'Carregando botões...'}
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {buttons.map(btn => (
              <button
                key={btn.id}
                onClick={() => handleAction(btn)}
                disabled={actionLoading}
                className="flex items-center gap-1 px-3 py-2 rounded bg-amber-500/10 text-amber-700
                           hover:bg-amber-500/20 text-sm font-medium"
              >
                <i className={`lucide lucide-${btn.button_icon} w-4 h-4`} />
                {btn.button_name}
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default SelectedVersesBar;
