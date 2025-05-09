import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChatHistory, categorizeChatHistory } from '@/types/chat';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatHistoryList from '@/components/ChatHistoryList';
import { useSidebarControl } from '@/hooks/useSidebarControl';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle } from 'lucide-react';
const ChatHistoryPage = () => {
  const {
    isSidebarOpen,
    toggleSidebar
  } = useSidebarControl();
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ChatHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const {
    subscribed
  } = useSubscription();
  const navigate = useNavigate();
  const loadChatHistory = async () => {
    try {
      setIsLoading(true);
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }
      const {
        data,
        error
      } = await supabase.from('chat_history').select('*').eq('user_id', session.user.id).eq('is_deleted', false).order('last_accessed', {
        ascending: false
      });
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
          is_deleted: item.is_deleted,
          pinned: item.pinned || false
        }));
        setChatHistory(formattedHistory);
        setFilteredHistory(formattedHistory);
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

  // Filter chats when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredHistory(chatHistory);
      return;
    }
    const filtered = chatHistory.filter(chat => chat.title.toLowerCase().includes(searchQuery.toLowerCase()) || chat.last_message && chat.last_message.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredHistory(filtered);
  }, [searchQuery, chatHistory]);
  const handleChatSelect = (slug: string) => {
    navigate(`/chat/${slug}`);
  };
  const categorizedHistory = categorizeChatHistory(filteredHistory);
  return <div className="flex flex-col md:flex-row h-screen">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} currentPath="/history" />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'} bg-gray-50`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
        <div className="pt-20 pb-16 px-4 max-w-5xl mx-auto">
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-800">Histórico de Conversas</h1>
              
            </div>
            
            {/* Search Bar */}
            <div className="relative max-w-lg w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Buscar conversas por título ou conteúdo..." className="pl-10 border-gray-200" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          
          {!subscribed && <div className="max-w-3xl mx-auto mb-8 bg-blue-50 p-5 rounded-lg border border-blue-200">
              <h3 className="font-medium mb-2 text-blue-800">Histórico Limitado</h3>
              <p className="text-sm text-blue-700 mb-4">
                Usuários do plano gratuito têm acesso limitado ao histórico completo. 
                Para acessar todo o histórico e mensagens, faça upgrade para o plano premium.
              </p>
              <Button variant="outline" size="sm" className="bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-800" onClick={() => navigate('/profile?tab=subscription')}>
                Ver planos
              </Button>
            </div>}
          
          <ChatHistoryList chatHistory={categorizedHistory} onChatSelect={handleChatSelect} isLoading={isLoading} onHistoryUpdated={loadChatHistory} searchQuery={searchQuery} />
        </div>
      </main>
    </div>;
};
export default ChatHistoryPage;