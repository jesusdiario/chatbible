
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChatHistory } from '@/types/chat';
import { Edit, Trash2, BookText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface ChatHistoryItemProps {
  chat: ChatHistory;
  onSelect: (slug: string) => void;
  onDelete: (id: string) => void;
  onHistoryUpdated?: () => void;
  isAccessible?: boolean;
}

export const ChatHistoryItem: React.FC<ChatHistoryItemProps> = ({ 
  chat, 
  onSelect, 
  onDelete,
  onHistoryUpdated,
  isAccessible = true 
}) => {
  const { toast } = useToast();

  const handleSelect = () => {
    if (!isAccessible) {
      toast({
        title: "Acesso restrito",
        description: "Faça upgrade para o plano premium para acessar o histórico completo.",
        variant: "destructive",
      });
      return;
    }
    onSelect(chat.slug || '');
  };

  // Formatar data no formato "23 de abril 10:30"
  const formattedDate = format(new Date(chat.lastAccessed), "dd 'de' MMMM HH:mm", { locale: ptBR });

  return (
    <div 
      className={`rounded-lg transition-colors mb-2 ${
        isAccessible 
          ? 'hover:bg-gray-50 border border-transparent cursor-pointer' 
          : 'opacity-70'
      }`}
      onClick={isAccessible ? handleSelect : undefined}
    >
      {/* Data formatada acima */}
      <div className="text-sm text-gray-500 mb-1 px-3 pt-2">
        {formattedDate}
      </div>
      
      {/* Informação do livro, se disponível */}
      {chat.book_slug && (
        <div className="text-lg font-medium text-gray-800 px-3">
          {chat.book_slug.charAt(0).toUpperCase() + chat.book_slug.slice(1)}
        </div>
      )}
      
      {/* Título da conversa */}
      <div className="text-base font-medium text-gray-800 px-3 mb-1">
        "{chat.title}"
      </div>
      
      {/* Ações na parte inferior */}
      <div className="flex justify-end space-x-1 p-1 mt-1 border-t border-gray-100">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            // Lógica para editar
            if (onHistoryUpdated) onHistoryUpdated();
          }}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          aria-label="Editar"
        >
          <Edit size={18} />
        </button>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(chat.id);
          }}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full"
          aria-label="Excluir"
        >
          <Trash2 size={18} />
        </button>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            // Lógica para fixar
            if (onHistoryUpdated) onHistoryUpdated();
          }}
          className={`p-2 hover:bg-gray-100 rounded-full ${chat.pinned ? 'text-chatgpt-accent' : 'text-gray-500 hover:text-chatgpt-accent'}`}
          aria-label={chat.pinned ? "Desafixar" : "Fixar"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pin">
            <line x1="12" x2="12" y1="17" y2="22" />
            <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatHistoryItem;
