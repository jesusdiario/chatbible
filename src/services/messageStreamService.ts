
import { supabase } from '@/integrations/supabase/client';
import { Message, SendMessageResponse } from '@/types/chat';
import { getPromptForBook } from './promptService';
import { persistChatMessages } from './chatPersistenceService';

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
      await persistChatMessages(newMessages, userId, slugToUse, book);
    } catch (err) {
      console.error('Error pre-persisting chat:', err);
    }
  }

  const { data: { session } } = await supabase.auth.getSession();
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
  const assistantMessage: Message = { role: "assistant", content: "" };

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
                await persistChatMessages(
                  [...newMessages, { ...assistantMessage }],
                  userId,
                  slugToUse,
                  book
                ).catch(err => console.error('Error incrementally updating during stream:', err));
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
          persistChatMessages(
            [...newMessages, assistantMessage],
            userId,
            slugToUse,
            book
          );
        }
      });
    });
  } else {
    streamPromise.then(() => {
      if (userId) {
        persistChatMessages(
          [...newMessages, assistantMessage],
          userId,
          slugToUse,
          book
        );
      }
    });
  }

  return { messages: [...newMessages, assistantMessage], slug: slugToUse };
};
