import { useState, useRef, useEffect } from 'react';
import { synthesizeAudio } from '@/services/audioService';
import { useToast } from './use-toast';

export const useAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Limpar recursos quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
        }
      }
    };
  }, []);

  const playAudio = async (text: string) => {
    try {
      // Se já estiver tocando, pare
      if (isPlaying) {
        stopAudio();
        return;
      }

      setIsLoading(true);
      toast({ title: "Gerando áudio..." });

      // Sintetizar o texto em áudio
      const result = await synthesizeAudio(text);

      if (!result.success || !result.audioUrl) {
        throw new Error(result.error || "Não foi possível gerar o áudio");
      }

      // Criar elemento de áudio se não existir
      if (!audioRef.current) {
        audioRef.current = new Audio();
      } else if (audioRef.current.src) {
        // Limpar URL anterior
        URL.revokeObjectURL(audioRef.current.src);
      }

      // Configurar o áudio
      audioRef.current.src = result.audioUrl;
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
      audioRef.current.onerror = (e) => {
        console.error("Erro ao reproduzir áudio:", e);
        toast({
          title: "Erro ao reproduzir áudio",
          description: "Não foi possível reproduzir o áudio.",
          variant: "destructive",
        });
        setIsPlaying(false);
        setIsLoading(false);
      };

      // Reproduzir o áudio
      await audioRef.current.play();
      setIsPlaying(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao processar áudio:", error);
      toast({
        title: "Erro ao processar áudio",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar o áudio.",
        variant: "destructive",
      });
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return {
    playAudio,
    stopAudio,
    isPlaying,
    isLoading
  };
};
