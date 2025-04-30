
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

  // Esta Promise representa o processamento do stream completo
  const streamPromise = new Promise<void>(async (resolve) => {
    try {
      // Controle de visibilidade e processamento em segundo plano
      let processingInBackground = document.visibilityState === 'hidden';
      
      // Detecta se o dispositivo é móvel para ajustar o throttling
      const isMobile = window.innerWidth <= 640;
      
      // Monitoramento de visibilidade
      const visibilityHandler = () => {
        processingInBackground = document.visibilityState === 'hidden';
      };
      
      // Adiciona o ouvinte de visibilidade
      document.addEventListener('visibilitychange', visibilityHandler);
      
      // Armazena chunks recebidos durante modo background
      let bufferedChunks = '';
      let lastPersistTime = Date.now();
      const PERSIST_INTERVAL = 2000; // 2 segundos
      
      // Controle para throttling no mobile
      let lastUpdateTime = Date.now();
      // Define intervalo entre atualizações baseado no dispositivo
      const UPDATE_THRESHOLD = isMobile ? 300 : 100; // ms
      let pendingUpdate = '';

      // Função que persiste as mensagens periodicamente
      const persistMessages = async () => {
        if (userId && assistantFull && (Date.now() - lastPersistTime > PERSIST_INTERVAL)) {
          try {
            const messagesWithAssistant = [...newMessages, { ...assistantMessage, content: assistantFull }];
            await persistChatMessages(userId, slugToUse, messagesWithAssistant, book);
            lastPersistTime = Date.now();
            return true;
          } catch (err) {
            console.error('Error during periodic persistence:', err);
            return false;
          }
        }
        return false;
      };

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
              // Sempre atualizamos o conteúdo completo
              assistantFull += payload.content;
              assistantMessage.content = assistantFull;
              
              // Implementação de throttling para dispositivos móveis
              if (!processingInBackground && onChunk) {
                const now = Date.now();
                
                if (now - lastUpdateTime >= UPDATE_THRESHOLD) {
                  // Se passou tempo suficiente, executa a atualização imediatamente
                  if (pendingUpdate) {
                    onChunk(pendingUpdate + payload.content);
                    pendingUpdate = '';
                  } else {
                    onChunk(payload.content);
                  }
                  lastUpdateTime = now;
                } else {
                  // Caso contrário, acumula para o próximo update
                  pendingUpdate += payload.content;
                  
                  // Programa um timeout para garantir que eventualmente atualizamos
                  if (!pendingUpdate.endTimeoutSet) {
                    pendingUpdate.endTimeoutSet = true;
                    setTimeout(() => {
                      if (pendingUpdate) {
                        onChunk(pendingUpdate);
                        pendingUpdate = '';
                      }
                      pendingUpdate.endTimeoutSet = false;
                    }, UPDATE_THRESHOLD);
                  }
                }
              } else {
                // Se estiver em background, acumulamos
                bufferedChunks += payload.content;
              }
              
              // Persistência periódica mesmo em background
              await persistMessages();
            }
          } catch (err) {
            console.error('[chat] JSON parse error:', err);
          }
        }
      }

      // Aplicar todos os chunks acumulados quando estiver em modo background
      if (bufferedChunks && onChunk && processingInBackground) {
        onChunk(bufferedChunks);
      }
      
      // Garante que qualquer pendência final seja processada
      if (pendingUpdate && onChunk) {
        onChunk(pendingUpdate);
      }
      
      // Remove o ouvinte de visibilidade
      document.removeEventListener('visibilitychange', visibilityHandler);
    } catch (streamError) {
      console.error('Error processing stream:', streamError);
    }
    resolve();
  });

  // Processamento em segundo plano e persistência final
  const completeProcessing = streamPromise.then(() => {
    console.log('Stream processing completed, final persistence');
    if (userId && slugToUse) {
      return persistChatMessages(userId, slugToUse, [...newMessages, { ...assistantMessage, content: assistantFull }], book)
        .catch(err => console.error('Error in final persistence:', err));
    }
  });

  // Aguarda o processamento do stream antes de retornar
  await streamPromise;

  return { 
    messages: [...newMessages, { ...assistantMessage, content: assistantFull }], 
    slug: slugToUse 
  };
};
