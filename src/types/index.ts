
import { ChatHistory } from './chat';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

// Interface for armazenar mensagens de um chat específico
export interface ChatData {
  id: string;
  title: string;
  messages: Message[];
  lastAccessed: Date;
}
