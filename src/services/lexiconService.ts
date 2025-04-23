
import { supabase } from '@/integrations/supabase/client';

interface LexiconResponse {
  reply: string;
}

export async function queryLexicon(
  word: string,
  messages: { role: string; content: string }[]
): Promise<LexiconResponse> {
  const { data: user } = await supabase.auth.getUser();
  
  const { data, error } = await supabase.functions.invoke('lexicon', {
    body: { 
      messages,
      userId: user?.id,
      word
    }
  });

  if (error) throw error;
  return data as LexiconResponse;
}
