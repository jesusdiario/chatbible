
import { Message, SendMessageResponse } from '@/types/chat';
import { persistChatMessages } from './persistenceService';
import { getPromptForBook } from './promptService';
import { supabase } from '@/integrations/supabase/client';

export { loadChatMessages } from './persistenceService';

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
  const slugToUse = slug ?? crypto.randomUUID();

  if (userId) {
    try {
      await persistChatMessages(userId, slugToUse, newMessages, book);
    } catch (err) {
      console.error('Error pre-persisting chat:', err);
    }
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();

  const systemPrompt = promptOverride ?? await getPromptForBook(book);

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
              
              if (userId) {
                try {
                  await persistChatMessages(userId, slugToUse, [...newMessages, { ...assistantMessage }], book);
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

  const backgroundProcessing = streamPromise.then(() => {
    if (userId && slugToUse) {
      return persistChatMessages(userId, slugToUse, [...newMessages, assistantMessage], book);
    }
  });

  if (typeof window !== 'undefined' && 'navigator' in window && 'scheduling' in navigator) {
    // @ts-ignore - This API is experimental, but useful for background processing
    navigator.scheduling?.isInputPending && navigator.scheduling.isInputPending();
  }

  return { messages: [...newMessages, assistantMessage], slug: slugToUse };
};
