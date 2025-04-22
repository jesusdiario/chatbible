
import { supabase } from '@/integrations/supabase/client';

export async function generateSpeech(text: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('tts', {
    body: { text }
  });

  if (error) throw error;
  // Retorna áudio base64
  if (!data?.audio) throw new Error('Falha ao gerar o áudio.');
  return data.audio as string;
}
