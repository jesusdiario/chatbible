
import { Message, ChatData } from '@/types/message';
import { ChatHistory } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

export const generateChatTitle = (messages: Message[]): string => {
  const firstUserMessage = messages.find(msg => msg.role === 'user');
  return firstUserMessage 
    ? firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '') 
    : 'Nova conversa';
};

export const saveChat = (
  chatId: string, 
  messageList: Message[], 
  setChatsData: React.Dispatch<React.SetStateAction<Record<string, ChatData>>>,
  setChatHistory: React.Dispatch<React.SetStateAction<ChatHistory[]>>
): void => {
  if (messageList.length === 0) return;

  const chatTitle = generateChatTitle(messageList);
  const now = new Date();

  // Atualizar os dados do chat
  setChatsData(prev => ({
    ...prev,
    [chatId]: {
      id: chatId,
      title: chatTitle,
      messages: messageList,
      lastAccessed: now
    }
  }));

  // Atualizar o histórico
  setChatHistory(prev => {
    // Verificar se o chat já existe no histórico
    const existingIndex = prev.findIndex(item => item.id === chatId);
    if (existingIndex >= 0) {
      // Atualizar o chat existente
      const updatedHistory = [...prev];
      updatedHistory[existingIndex] = {
        ...updatedHistory[existingIndex],
        title: chatTitle,
        lastAccessed: now
      };
      return updatedHistory;
    } else {
      // Adicionar novo chat ao histórico
      return [...prev, {
        id: chatId,
        title: chatTitle,
        lastAccessed: now
      }];
    }
  });
};

export const createNewChatId = (): string => {
  return uuidv4();
};

export const loadChatData = (
  chatId: string,
  chatsData: Record<string, ChatData>,
  setCurrentChatId: React.Dispatch<React.SetStateAction<string | null>>,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setChatsData: React.Dispatch<React.SetStateAction<Record<string, ChatData>>>,
  setChatHistory: React.Dispatch<React.SetStateAction<ChatHistory[]>>,
  showToastError: (message: string) => void
): void => {
  const chatData = chatsData[chatId];
  if (chatData) {
    setCurrentChatId(chatId);
    setMessages(chatData.messages);

    // Atualizar a data de último acesso
    const now = new Date();

    // Atualizar os dados do chat
    setChatsData(prev => ({
      ...prev,
      [chatId]: {
        ...chatData,
        lastAccessed: now
      }
    }));

    // Atualizar o histórico
    setChatHistory(prev => {
      return prev.map(item => item.id === chatId ? {
        ...item,
        lastAccessed: now
      } : item);
    });
  } else {
    showToastError("Chat não encontrado");
  }
};
