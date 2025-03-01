
import { useSidebarState } from './useSidebarState';
import { useApiKey } from './useApiKey';
import { useChat } from './useChat';

export function useChatState() {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebarState();
  const { handleApiKeyChange } = useApiKey();
  const { 
    messages, 
    isLoading, 
    startNewChat, 
    handleSendMessage, 
    handleChatSelect,
    chatHistory
  } = useChat();

  // Handle sidebar toggle on mobile after chat selection
  const handleMobileChatSelect = (chatId: string) => {
    handleChatSelect(chatId);
    // Close sidebar on mobile devices after selecting a chat
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return {
    isSidebarOpen,
    setIsSidebarOpen,
    messages,
    isLoading,
    chatHistory,
    startNewChat,
    handleSendMessage,
    handleApiKeyChange,
    handleChatSelect: handleMobileChatSelect
  };
}
