
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ChatHistoryEmptyStateProps {
  searchQuery?: string;
}

const ChatHistoryEmptyState: React.FC<ChatHistoryEmptyStateProps> = ({ searchQuery }) => {
  const navigate = useNavigate();

  return searchQuery ? (
    <div className="text-center py-8">
      <p className="text-gray-500 mb-4">Nenhuma conversa encontrada para "{searchQuery}"</p>
      <Button onClick={() => navigate('/chat/new')}>
        Iniciar nova conversa
      </Button>
    </div>
  ) : (
    <div className="text-center py-8">
      <p className="text-gray-500 mb-4">Nenhuma conversa encontrada</p>
      <Button onClick={() => navigate('/chat/new')}>
        Iniciar nova conversa
      </Button>
    </div>
  );
};

export default ChatHistoryEmptyState;
