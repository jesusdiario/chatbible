
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MessageSquareText } from 'lucide-react';

interface ChatHistoryEmptyStateProps {
  searchQuery?: string;
}

const ChatHistoryEmptyState: React.FC<ChatHistoryEmptyStateProps> = ({ searchQuery }) => {
  const navigate = useNavigate();

  return searchQuery ? (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <MessageSquareText className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma conversa encontrada</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Não encontramos nenhuma conversa com "{searchQuery}" no histórico.
      </p>
      <Button 
        onClick={() => navigate('/chat/new')}
        className="bg-chatgpt-accent hover:bg-blue-700"
      >
        Iniciar nova conversa
      </Button>
    </div>
  ) : (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <MessageSquareText className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma conversa ainda</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Comece uma nova conversa para explorar os temas e livros bíblicos.
      </p>
      <Button 
        onClick={() => navigate('/chat/new')}
        className="bg-chatgpt-accent hover:bg-blue-700"
      >
        Iniciar nova conversa
      </Button>
    </div>
  );
};

export default ChatHistoryEmptyState;
