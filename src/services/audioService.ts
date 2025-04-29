
import { supabase } from '@/integrations/supabase/client';

export interface TranscriptionResult {
  text: string;
  language?: string;
}

export interface SynthesisResult {
  audio: string;
}

export interface SynthesisOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' | 'ash';
  model?: 'tts-1' | 'tts-1-hd';
}

/**
 * Transcribe audio file to text using OpenAI's Whisper model.
 * @param audioFile The audio file to transcribe
 * @param language Optional language code (ISO-639-1)
 * @returns Transcription result with text
 */
export const transcribeAudio = async (
  audioFile: File,
  language?: string
): Promise<TranscriptionResult> => {
  try {
    // Create FormData for the audio file
    const formData = new FormData();
    formData.append('file', audioFile);
    if (language) {
      formData.append('language', language);
    }

    const { data, error } = await supabase.functions.invoke('transcribe-audio', {
      body: formData,
      headers: {
        // No Content-Type header, let the browser set it with the boundary for FormData
      },
    });

    if (error) {
      console.error('Error transcribing audio:', error);
      throw new Error(`Transcription failed: ${error.message || 'Unknown error'}`);
    }

    return data as TranscriptionResult;
  } catch (error) {
    console.error('Error in transcribeAudio:', error);
    throw error;
  }
};

/**
 * Synthesize text to speech using OpenAI's TTS model.
 * @param text The text to convert to speech
 * @param options Optional configuration for voice and model
 * @returns Base64 encoded audio data
 */
export const synthesizeSpeech = async (
  text: string,
  options?: SynthesisOptions
): Promise<SynthesisResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('synthesize-speech', {
      body: {
        text,
        voice: options?.voice || 'ash',
        model: options?.model || 'tts-1',
      },
    });

    if (error) {
      console.error('Error synthesizing speech:', error);
      throw new Error(`Speech synthesis failed: ${error.message || 'Unknown error'}`);
    }

    return data as SynthesisResult;
  } catch (error) {
    console.error('Error in synthesizeSpeech:', error);
    throw error;
  }
};
