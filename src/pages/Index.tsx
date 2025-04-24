
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";
import ChatInput from "@/components/ChatInput";
import MessageList from "@/components/MessageList";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useChatState } from "@/hooks/useChatState";
import { sendChatMessage, loadChatMessages } from "@/services/chatService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Message } from "@/types/chat";
import { categorizeChatHistory } from "@/types/chat";

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();

  const {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    userId,
    chatHistory,
    setChatHistory
  } = useChatState({ slug });

  React.useEffect(() => {
    const loadExistingChat = async () => {
      if (slug) {
        setIsLoading(true);
        try {
          const loadedMessages = await loadChatMessages(slug);
          if (loadedMessages) {
            setMessages(loadedMessages);
          }
        } catch (error) {
          toast({
            title: "Erro",
            description: "Erro ao carregar o histórico da conversa",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadExistingChat();
  }, [slug, setMessages, setIsLoading]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);
    const userMessage: Message = { role: "user", content };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    try {
      const result = await sendChatMessage(content, messages, undefined, userId, slug);
      setMessages(result.messages);
      
      if (!slug) {
        navigate(`/chat/${result.slug}`);
      }

      if (userId) {
        const { data: updatedHistory } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', userId)
          .order('last_accessed', { ascending: false });

        if (updatedHistory) {
          const formattedHistory = updatedHistory.map(item => ({
            id: item.id,
            title: item.title,
            lastAccessed: new Date(item.last_accessed),
            user_id: item.user_id,
            book_slug: item.book_slug,
            last_message: item.last_message,
            slug: item.slug
          }));
          setChatHistory(formattedHistory);
        }
      }
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err?.message || "Erro inesperado ao enviar mensagem",
        variant: "destructive",
      });
      const errorMessage: Message = { 
        role: "assistant", 
        content: "Ocorreu um erro: " + (err?.message || "Erro inesperado") 
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSelect = async (chatId: string) => {
    if (chatId === 'new') {
      setMessages([]);
      navigate('/');
      return;
    }

    try {
      const messages = await loadChatMessages(chatId);
      if (messages) {
        setMessages(messages);
        navigate(`/chat/${chatId}`);
      }
    } catch (err: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar o histórico da conversa",
        variant: "destructive",
      });
    }
  };

  const timeframes = categorizeChatHistory(chatHistory);

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <ErrorBoundary>
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onApiKeyChange={() => {}}
          onChatSelect={handleChatSelect}
          currentPath={window.location.pathname}
        />
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
          <ChatHeader
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <div className={`flex h-full flex-col ${messages.length === 0 ? 'items-center justify-center' : 'justify-between'} pt-[60px] pb-4`}>
            {messages.length === 0 ? (
              <div className="w-full max-w-3xl mx-auto px-4">
                <h1 className="text-2xl font-bold mb-4">Histórico de Conversas</h1>
                {timeframes.length === 0 ? (
                  <div className="text-center">
                    <p className="text-gray-400 mb-4">Nenhuma conversa ainda.</p>
                    <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
                  </div>
                ) : (
                  <>
                    <div className="space-y-6 mb-8">
                      {timeframes.map(timeframe => (
                        <div key={timeframe.title}>
                          <h2 className="text-sm text-gray-500 mb-2">{timeframe.title}</h2>
                          <ul className="space-y-2">
                            {timeframe.items.map(chat => (
                              <li
                                key={chat.id}
                                onClick={() => handleChatSelect(chat.slug || '')}
                                className="p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h3 className="font-medium text-gray-200">{chat.title}</h3>
                                    {chat.last_message && (
                                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                        {chat.last_message}
                                      </p>
                                    )}
                                  </div>
                                  <time className="text-xs text-gray-500 whitespace-nowrap ml-4">
                                    {new Date(chat.lastAccessed).toLocaleDateString()}
                                  </time>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="sticky bottom-4">
                      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                {isLoading && <LoadingSpinner />}
                <MessageList messages={messages} />
                <div className="w-full max-w-3xl mx-auto px-4 py-2">
                  <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
                </div>
              </>
            )}
          </div>
        </main>
      </ErrorBoundary>
    </div>
  );
};

export default Index;
