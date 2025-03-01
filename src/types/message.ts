
export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export interface ChatData {
  id: string;
  title: string;
  messages: Message[];
  lastAccessed: Date;
}
