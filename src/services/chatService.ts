
import { Message, SendMessageResponse } from '@/types/chat';
import { persistChatMessages } from './persistenceService';
import { getPromptForBook } from './promptService';
import { supabase } from '@/integrations/supabase/client';

export { loadChatMessages } from './persistenceService';

// ...imports e loadChatMessages permanecem iguais

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

  const { data: { session } } = await supabase.auth.getSession();
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

  const reader   = response.body.getReader();
  const decoder  = new TextDecoder();
  let assistantFull = '';
  const assistantMessage: Message = { role: 'assistant', content: '' };

  /** PROCESSAMENTO DO STREAM **/
  await (async () => {
    try {
      // Apenas logamos mudanças de visibilidade agora
      const visibilityHandler = () =>
        console.log('[chat] visibility:', document.visibilityState);
      document.addEventListener('visibilitychange', visibilityHandler);

      let lastPersist = Date.now();
      const PERSIST_EACH = 2000; // 2 s

      const persistIfNeeded = async () => {
        if (
          userId &&
          assistantFull &&
          Date.now() - lastPersist > PERSIST_EACH
        ) {
          await persistChatMessages(
            userId,
            slugToUse,
            [...newMessages, { ...assistantMessage, content: assistantFull }],
            book
          ).catch((err) =>
            console.error('Error during periodic persistence:', err)
          );
          lastPersist = Date.now();
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        for (const line of chunk.split('\n').filter(Boolean)) {
          if (!line.startsWith('data: ')) continue;
          try {
            const payload = JSON.parse(line.replace('data: ', ''));
            if (payload.content) {
              assistantFull += payload.content;
              assistantMessage.content = assistantFull;

              /** ⬇️  SEMPRE atualiza a UI */
              onChunk?.(payload.content);

              await persistIfNeeded();
            }
          } catch (err) {
            console.error('[chat] JSON parse error:', err);
          }
        }
      }

      document.removeEventListener('visibilitychange', visibilityHandler);
    } catch (streamErr) {
      console.error('Error processing stream:', streamErr);
    }
  })();

  /** Persistência final */
  if (userId) {
    await persistChatMessages(
      userId,
      slugToUse,
      [...newMessages, { ...assistantMessage, content: assistantFull }],
      book
    ).catch((err) => console.error('Error in final persistence:', err));
  }

  return {
    messages: [...newMessages, { ...assistantMessage, content: assistantFull }],
    slug: slugToUse
  };
};
