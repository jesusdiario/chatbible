
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
