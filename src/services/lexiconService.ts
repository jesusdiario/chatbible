// src/services/lexiconService.ts
import { supabase } from '@/integrations/supabase/client';

/**
 * Resposta do Assistant via Edge Function
 */
export interface AssistantResponse {
  threadId: string;
  response: string;
}

/**
 * Envia mensagem ao Assistant e retorna a resposta junto ao threadId atualizado.
 */
export async function queryLexicon(
  message: string,
  threadId?: string
): Promise<AssistantResponse> {
  // Certifica que o usuário está autenticado
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  // Chama a Edge Function 'lexicon'
  const { data, error } = await supabase.functions.invoke('lexicon', {
    body: JSON.stringify({ message, threadId })
  });

  if (error) {
    throw error;
  }

  // Retorna o threadId e a resposta do Assistant
  return data as AssistantResponse;
}
