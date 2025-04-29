
import { ChatProps, ChatState } from '@/types/chat';
import { useUserSession } from './useUserSession';
import { useChatHistory } from './useChatHistory';
import { useChatMessages } from './useChatMessages';

export const useChatState = (props?: ChatProps): ChatState => {
  const book = props?.book;
  const slug = props?.slug;
  
  // Get user session
  const { userId } = useUserSession();
  
  // Get chat history
  const { chatHistory, setChatHistory, loadChatHistory } = useChatHistory(userId);
  
  // Get chat messages
  const { messages, setMessages, isLoading, setIsLoading } = useChatMessages(userId, slug, book);

  return {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    userId,
    chatHistory,
    setChatHistory
  };
};
