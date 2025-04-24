export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatHistory {
  id: string;
  title: string;
  lastAccessed: Date;
  user_id: string;
  book_slug?: string;
  last_message?: string;
  slug?: string;
}

export interface TimeframedHistory {
  title: string;
  items: ChatHistory[];
}

export const categorizeChatHistory = (chats: ChatHistory[]): TimeframedHistory[] => {
  if (!chats || chats.length === 0) {
    return [];
  }

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const today: ChatHistory[] = [];
  const yesterdayChats: ChatHistory[] = [];
  const lastSevenDays: ChatHistory[] = [];
  const lastThirtyDays: ChatHistory[] = [];

  chats.forEach(chat => {
    const chatDate = new Date(chat.lastAccessed);
    
    if (chatDate.toDateString() === now.toDateString()) {
      today.push(chat);
    } else if (chatDate.toDateString() === yesterday.toDateString()) {
      yesterdayChats.push(chat);
    } else if (chatDate >= sevenDaysAgo) {
      lastSevenDays.push(chat);
    } else if (chatDate >= thirtyDaysAgo) {
      lastThirtyDays.push(chat);
    }
  });

  const timeframes: TimeframedHistory[] = [];

  if (today.length > 0) {
    timeframes.push({
      title: "Hoje",
      items: today.sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
    });
  }

  if (yesterdayChats.length > 0) {
    timeframes.push({
      title: "Ontem",
      items: yesterdayChats.sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
    });
  }

  if (lastSevenDays.length > 0) {
    timeframes.push({
      title: "Últimos 7 Dias",
      items: lastSevenDays.sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
    });
  }

  if (lastThirtyDays.length > 0) {
    timeframes.push({
      title: "Últimos 30 Dias",
      items: lastThirtyDays.sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
    });
  }

  return timeframes;
};

export interface ChatState {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  userId: string | null;
  chatHistory: ChatHistory[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatHistory[]>>;
}

export interface ChatProps {
  book?: string;
  slug?: string;
}

export interface SendMessageResponse {
  messages: Message[];
  slug?: string;
}

export interface ChatHistoryRecord {
  id: string;
  user_id: string;
  title: string;
  book_slug?: string;
  last_message?: string;
  last_accessed: string;
  messages: Message[];
  slug: string;
}
