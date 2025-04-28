import { supabase } from '@/integrations/supabase/client';

// Tipos para as funções de áudio
export interface AudioTranscriptionResponse {
  text: string;
  success: boolean;
  error?: string;
}

export interface AudioSynthesisResponse {
  audioUrl: string;
  success: boolean;
  error?: string;
}

/**
 * Transcreve áudio para texto usando a API Speech-to-Text da OpenAI
 * @param audioBlob - O blob de áudio a ser transcrito
 * @returns Uma promessa que resolve para a resposta da transcrição
 */
export const transcribeAudio = async (audioBlob: Blob): Promise<AudioTranscriptionResponse> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return {
        text: '',
        success: false,
        error: 'Usuário não autenticado'
      };
    }

    // Criar um FormData para enviar o arquivo de áudio
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');

    // Enviar para a função Supabase Edge que encaminhará para a API da OpenAI
    const response = await fetch(
      'https://qdukcxetdfidgxcuwjdo.functions.supabase.co/transcribe-audio',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: formData
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Erro ao transcrever áudio');
    }

    return {
      text: result.text,
      success: true
    };
  } catch (error) {
    console.error('Erro na transcrição de áudio:', error);
    return {
      text: '',
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido na transcrição'
    };
  }
};

/**
 * Sintetiza texto em áudio usando a API Text-to-Speech da OpenAI
 * @param text - O texto a ser convertido em áudio
 * @param voice - A voz a ser usada (padrão: 'alloy')
 * @returns Uma promessa que resolve para a resposta da síntese
 */
export const synthesizeAudio = async (
  text: string,
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'nova'
): Promise<AudioSynthesisResponse> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return {
        audioUrl: '',
        success: false,
        error: 'Usuário não autenticado'
      };
    }

    // Enviar para a função Supabase Edge que encaminhará para a API da OpenAI
    const response = await fetch(
      'https://qdukcxetdfidgxcuwjdo.functions.supabase.co/synthesize-speech',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          text,
          voice,
          model: 'tts-1',
          speed: 1.0
        })
      }
    );

    // A resposta será um blob de áudio
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao sintetizar áudio');
    }

    // Criar uma URL para o blob de áudio
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    return {
      audioUrl,
      success: true
    };
  } catch (error) {
    console.error('Erro na síntese de áudio:', error);
    return {
      audioUrl: '',
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido na síntese'
    };
  }
};
