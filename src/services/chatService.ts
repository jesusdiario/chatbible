
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

  // Use Promise.race para gerenciar o tempo limite e continuar o processamento em segundo plano
  const streamPromise = new Promise<void>(async (resolve) => {
    try {
      // Sinaliza se a página está processando em segundo plano
      let processingInBackground = false;
      
      // Função para monitorar mudanças na visibilidade da página
      const visibilityHandler = () => {
        processingInBackground = document.visibilityState === 'hidden';
        console.log('Visibility changed:', document.visibilityState, 'Processing in background:', processingInBackground);
      };
      
      // Adiciona o ouvinte de visibilidade
      document.addEventListener('visibilitychange', visibilityHandler);
      
      // Loop de leitura do stream
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
              
              // Só chama o callback se não estivermos em segundo plano
              // Isso evita erros de rendering quando a página não está visível
              if (!processingInBackground && onChunk) {
                onChunk(payload.content);
              }
              
              // Sempre tenta persistir, mesmo em segundo plano
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
      
      // Remove o ouvinte de visibilidade
      document.removeEventListener('visibilitychange', visibilityHandler);
    } catch (streamError) {
      console.error('Error processing stream:', streamError);
    }
    resolve();
  });

  // Melhoria na persistência após o processamento completo
  const backgroundProcessing = streamPromise.then(() => {
    console.log('Stream processing completed, final persistence');
    if (userId && slugToUse) {
      return persistChatMessages(userId, slugToUse, [...newMessages, assistantMessage], book)
        .catch(err => console.error('Error in final persistence:', err));
    }
  });

  // Usa requestIdleCallback quando disponível para otimizar o processamento em segundo plano
  if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        console.log('Using requestIdleCallback for background processing');
        // Apenas para garantir que isso não bloqueia a UI
      });
    }
    
    if ('scheduling' in navigator && 'isInputPending' in (navigator as any).scheduling) {
      // @ts-ignore - Esta API é experimental
      (navigator.scheduling as any).isInputPending();
    }
  }

  return { messages: [...newMessages, assistantMessage], slug: slugToUse };
};
