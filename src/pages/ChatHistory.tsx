import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChatHistory, categorizeChatHistory } from '@/types/chat';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatHistoryList from '@/components/ChatHistoryList';
import { useSidebarControl } from '@/hooks/useSidebarControl';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ChatHistoryPage = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebarControl();
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { subscribed } = useSubscription();
  const navigate = useNavigate();

  const loadChatHistory = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_deleted', false)
        .order('last_accessed', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const formattedHistory = data.map(item => ({
          id: item.id,
          title: item.title,
          lastAccessed: new Date(item.last_accessed),
          user_id: item.user_id,
          book_slug: item.book_slug,
          last_message: item.last_message,
          slug: item.slug,
          subscription_required: item.subscription_required,
          is_accessible: item.is_accessible,
          is_deleted: item.is_deleted
        }));
        
        setChatHistory(formattedHistory);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChatHistory();
  }, [navigate]);

  const handleChatSelect = (slug: string) => {
    navigate(`/chat/${slug}`);
  };
  
  const categorizedHistory = categorizeChatHistory(chatHistory);

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar}
        currentPath="/history"
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={toggleSidebar} 
        />
        <div className="pt-20 pb-6 px-4">
          <div className="flex justify-between items-center max-w-3xl mx-auto mb-6">
            <h1 className="text-2xl font-bold">Histórico de Conversas</h1>
            <Button onClick={() => navigate('/chat/new')}>Nova Conversa</Button>
          </div>
          
          {!subscribed && (
            <div className="max-w-3xl mx-auto mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-medium mb-1 text-blue-800">Histórico Limitado</h3>
              <p className="text-sm text-blue-700 mb-2">
                Usuários do plano gratuito têm acesso limitado ao histórico completo. 
                Para acessar todo o histórico e mensagens, faça upgrade para o plano premium.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-blue-100 hover:bg-blue-200 border-blue-300"
                onClick={() => navigate('/profile?tab=subscription')}
              >
                Ver planos
              </Button>
            </div>
          )}
          
          <ChatHistoryList 
            chatHistory={categorizedHistory} 
            onChatSelect={handleChatSelect}
            isLoading={isLoading}
            onHistoryUpdated={loadChatHistory}
          />
        </div>
      </main>
    </div>
  );
};

export default ChatHistoryPage;
