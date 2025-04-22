
import { supabase } from '@/integrations/supabase/client';
import { Message, SendMessageResponse, ChatHistoryRecord } from '@/types/chat';

export const getPromptForBook = async (bookSlug?: string): Promise<string | null> => {
  if (!bookSlug) return null;

  const { data: prompt } = await supabase
    .from('bible_prompts')
    .select('prompt_text')
    .eq('book_slug', bookSlug)
    .single();

  return prompt?.prompt_text || null;
};

export const sendChatMessage = async (
  content: string,
  messages: Message[],
  book?: string,
  userId?: string,
  slug?: string,
  promptOverride?: string,
  onChunk?: (chunk: string) => void
): Promise<SendMessageResponse> => {
  const userMessage: Message = { role: "user", content };
  const newMessages = [...messages, userMessage];
  
  const systemPrompt = promptOverride || await getPromptForBook(book);

  const { data: stream, error } = await supabase.functions.invoke('chat', {
    body: { 
      messages: newMessages,
      systemPrompt
    },
    responseType: 'stream'
  });

  if (error) throw error;

  let fullContent = '';
  const assistantMessage: Message = { 
    role: "assistant", 
    content: '' 
  };

  const reader = stream.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;

      try {
        const data = JSON.parse(line.replace('data: ', ''));
        if (data.content) {
          fullContent += data.content;
          assistantMessage.content = fullContent;
          onChunk?.(data.content);
        }
      } catch (err) {
        console.error('Error parsing chunk:', err);
      }
    }
  }

  assistantMessage.content = fullContent;

  if (userId) {
    const newSlug = slug || crypto.randomUUID();
    await supabase.from('chat_history').upsert({
      user_id: userId,
      title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
      book_slug: book,
      last_message: assistantMessage.content,
      last_accessed: new Date().toISOString(),
      messages: JSON.stringify(newMessages.concat(assistantMessage)) as any,
      slug: newSlug
    });

    return { messages: [...newMessages, assistantMessage], slug: newSlug };
  }

  return { messages: [...newMessages, assistantMessage], slug };
};

export const loadChatMessages = async (chatId: string): Promise<Message[] | null> => {
  const { data } = await supabase
    .from('chat_history')
    .select('messages')
    .eq('id', chatId)
    .single();
  
  if (!data || !data.messages) return null;
  
  return JSON.parse(data.messages as string) as Message[];
};
