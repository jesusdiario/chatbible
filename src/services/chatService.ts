
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
  onChunk?: (chunk: string) => void,
  onLoadingStageChange?: (stage: string) => void
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

  // Estágios de carregamento para mostrar ao usuário
  const loadingStages = [
    "Aguarde...",
    "Iniciando pesquisa...",
    "Pesquisa aprofundada iniciada...",
    "+ de 100 estudos encontrados!",
    "Iniciando curadoria personalizada...",
    "Iniciando revisão teológica reformada...",
    "Iniciando ajuste de aprendizado adaptativo...",
    "Iniciando construção do estudo...",
    "Concluindo..."
  ];
  
  // Inicia a sequência de estágios de carregamento
  let currentStageIndex = 0;
  const stageInterval = setInterval(() => {
    if (currentStageIndex < loadingStages.length && onLoadingStageChange) {
      onLoadingStageChange(loadingStages[currentStageIndex]);
      currentStageIndex++;
    }
    
    if (currentStageIndex >= loadingStages.length) {
      clearInterval(stageInterval);
    }
  }, 1000); // Muda o estágio a cada 1 segundo

  // Tenta usar o Assistant primeiro se tiver book definido
  if (book && !promptOverride) {
    try {
      console.log(`Tentando usar assistant para book: ${book}`);
      
      // Chama a edge function assistant-chat
      const response = await fetch(
        `https://qdukcxetdfidgxcuwjdo.functions.supabase.co/assistant-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session && { Authorization: `Bearer ${session.access_token}` })
          },
          body: JSON.stringify({ 
            messages: newMessages,
            bookSlug: book
          })
        }
      );
      
      const responseData = await response.json();
      
      // Se não tiver assistant ou algum erro ocorrer, usa o fluxo normal com prompt
      if (responseData.usePrompt) {
        console.log('Usando o fluxo normal com prompt_text');
        // Continua com o fluxo normal abaixo
      } else if (response.ok) {
        // Se tiver resposta de sucesso do assistant, processa
        let assistantFull = responseData.content || '';
        const assistantMessage: Message = { role: 'assistant', content: assistantFull };
        
        // Limpa o intervalo dos estágios e marca como concluído
        clearInterval(stageInterval);
        if (onLoadingStageChange) {
          onLoadingStageChange("Concluído!");
          setTimeout(() => {
            if (onChunk) {
              onChunk(assistantFull);
            }
          }, 1000);
        }
        
        // Persiste as mensagens finais
        if (userId && slugToUse) {
          await persistChatMessages(userId, slugToUse, [...newMessages, assistantMessage], book);
        }
        
        return {
          messages: [...newMessages, assistantMessage],
          slug: slugToUse
        };
      } else {
        console.error('Erro no assistant-chat, usando o fluxo normal:', responseData.error);
        // Continua com o fluxo normal abaixo
      }
    } catch (err) {
      console.error('Erro ao tentar usar assistant-chat:', err);
      // Continua com o fluxo normal abaixo
    }
  }

  // Fluxo normal com a edge function chat original
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

  if (!response.body) {
    clearInterval(stageInterval);
    throw new Error('No stream returned from edge-function');
  }

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
      // Para resolver o erro de tipo, criamos um objeto para armazenar o timeout flag
      const pendingUpdateState = { timeoutSet: false };

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
                    // Não mostramos o conteúdo em tempo real para o usuário conforme solicitado
                    // onChunk(pendingUpdate + payload.content);
                    pendingUpdate = '';
                  } else {
                    // Não mostramos o conteúdo em tempo real para o usuário conforme solicitado
                    // onChunk(payload.content);
                  }
                  lastUpdateTime = now;
                } else {
                  // Caso contrário, acumula para o próximo update
                  pendingUpdate += payload.content;
                  
                  // Programa um timeout para garantir que eventualmente atualizamos
                  if (!pendingUpdateState.timeoutSet) {
                    pendingUpdateState.timeoutSet = true;
                    setTimeout(() => {
                      if (pendingUpdate) {
                        // Não mostramos o conteúdo em tempo real para o usuário conforme solicitado
                        // onChunk(pendingUpdate);
                        pendingUpdate = '';
                      }
                      pendingUpdateState.timeoutSet = false;
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
        // Não mostramos o conteúdo em tempo real para o usuário conforme solicitado
        // onChunk(bufferedChunks);
      }
      
      // Garante que qualquer pendência final seja processada
      if (pendingUpdate && onChunk) {
        // Não mostramos o conteúdo em tempo real para o usuário conforme solicitado
        // onChunk(pendingUpdate);
      }
      
      // Remove o ouvinte de visibilidade
      document.removeEventListener('visibilitychange', visibilityHandler);
      
      // Limpa o intervalo dos estágios e marca como concluído
      clearInterval(stageInterval);
      if (onLoadingStageChange) {
        onLoadingStageChange("Concluído!");
        // Pequeno atraso antes de mostrar a resposta final
        setTimeout(() => {
          if (onChunk) {
            onChunk(assistantFull);
          }
        }, 1000);
      }
    } catch (streamError) {
      console.error('Error processing stream:', streamError);
      clearInterval(stageInterval);
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
