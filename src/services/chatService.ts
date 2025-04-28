import { supabase } from '@/integrations/supabase/client';
import { Message, SendMessageResponse } from '@/types/chat';

/**
 * Busca o prompt-sistema padrão para um livro.
 */
export const getPromptForBook = async (
  bookSlug?: string
): Promise<string | null> => {
  if (!bookSlug) return null;

  const { data } = await supabase
    .from('bible_prompts')
    .select('prompt_text')
    .eq('book_slug', bookSlug)
    .single();

  return data?.prompt_text ?? null;
};

/**
 * Envia uma mensagem do usuário, recebe o stream da edge-function
 * e persiste (incrementalmente) no Supabase.
 */
export const sendChatMessage = async (
  content: string,
  messages: Message[],
  book?: string,
  userId?: string,
  slug?: string,
  promptOverride?: string,
  onChunk?: (chunk: string) => void
): Promise<SendMessageResponse> => {
  const userMessage: Message = { role: 'user', content };
  const newMessages = [...messages, userMessage];
  const systemPrompt = promptOverride ?? await getPromptForBook(book);
  const slugToUse = slug ?? crypto.randomUUID();

  if (userId) {
    try {
      await supabase.from('chat_history').upsert(
        {
          slug: slugToUse,
          user_id: userId,
          title: content.slice(0, 50) + (content.length > 50 ? '…' : ''),
          book_slug: book,
          last_message: null,
          last_accessed: new Date().toISOString(),
          messages: JSON.stringify(newMessages)
        },
        { onConflict: 'slug' }
      );
    } catch (err) {
      console.error('Error pre-persisting chat:', err);
    }
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();

  const response = await fetch(
    'https://qdukcxetdfidgxcuwjdo.functions.supabase.co/chat',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session && { Authorization: `Bearer ${session.access_token}` })
      },
      body: JSON.stringify({ messages: newMessages, systemPrompt })
    }
  );

  if (!response.body) throw new Error('No stream returned from edge-function');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let assistantFull = '';
  const assistantMessage: Message = { role: 'assistant', content: '' };

  const streamPromise = new Promise<void>(async (resolve) => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value);
        const lines = chunkStr.split('\n').filter(l => l.trim() !== '');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          try {
            const payload = JSON.parse(line.replace('data: ', ''));
            if (payload.content) {
              assistantFull += payload.content;
              assistantMessage.content = assistantFull;
              onChunk?.(payload.content);
              
              if (userId && assistantFull.length % 100 === 0) {
                try {
                  await supabase
                    .from('chat_history')
                    .update({
                      messages: JSON.stringify([...newMessages, { ...assistantMessage }]),
                      last_message: assistantFull,
                      last_accessed: new Date().toISOString()
                    })
                    .eq('slug', slugToUse);
                } catch (updateError) {
                  console.error('Error incrementally updating during stream:', updateError);
                }
              }
            }
          } catch (err) {
            console.error('[chat] JSON parse error:', err);
          }
        }
      }
    } catch (streamError) {
      console.error('Error processing stream:', streamError);
    }
    resolve();
  });

  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      streamPromise.then(() => {
        if (userId) {
          supabase
            .from('chat_history')
            .update({
              messages: JSON.stringify([...newMessages, assistantMessage]),
              last_message: assistantFull,
              last_accessed: new Date().toISOString()
            })
            .eq('slug', slugToUse);
        }
      });
    });
  } else {
    streamPromise.then(() => {
      if (userId) {
        supabase
          .from('chat_history')
          .update({
            messages: JSON.stringify([...newMessages, assistantMessage]),
            last_message: assistantFull,
            last_accessed: new Date().toISOString()
          })
          .eq('slug', slugToUse);
      }
    });
  }

  return { messages: [...newMessages, assistantMessage], slug: slugToUse };
};

/**
 * Carrega o histórico completo de messages para um slug.
 */
export const loadChatMessages = async (
  slug: string
): Promise<Message[] | null> => {
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .select('messages')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error loading chat messages:', error);
      return null;
    }

    if (!data?.messages) return null;
    
    if (typeof data.messages === 'string') {
      return JSON.parse(data.messages) as Message[];
    }
    
    if (Array.isArray(data.messages)) {
      const isValidMessageArray = data.messages.every(
        (item: any): item is Message => 
          typeof item === 'object' && 
          item !== null &&
          'role' in item && 
          'content' in item &&
          (item.role === 'user' || item.role === 'assistant')
      );
      
      if (isValidMessageArray) {
        return data.messages as unknown as Message[];
      }
      
      console.error('Invalid message format in database:', data.messages);
      return null;
    }
    
    console.error('Unexpected message format in database:', data.messages);
    return null;
  } catch (err) {
    console.error('Error parsing chat messages:', err);
    return null;
  }
};
