
import { ChatHistory } from './chat';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

// Interface for storing messages of a specific chat
export interface ChatData {
  id: string;
  title: string;
  messages: Message[];
  lastAccessed: Date;
}

// Interface for chat management
export interface ChatManagementInterface {
  currentChatId: string | null;
  setCurrentChatId: React.Dispatch<React.SetStateAction<string | null>>;
  startNewChat: () => void;
  saveCurrentChat: (chatId: string, messageList: Message[]) => void;
  handleChatSelect: (chatId: string) => void;
}

// Interface for message sending
export interface SendMessageInterface {
  isLoading: boolean;
  handleSendMessage: (content: string) => void;
}

// Shared context type for chat state
export interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  chatHistory: ChatHistory[];
  startNewChat: () => void;
  handleSendMessage: (content: string) => void;
  handleApiKeyChange: (key: string) => void;
  handleChatSelect: (chatId: string) => void;
}
