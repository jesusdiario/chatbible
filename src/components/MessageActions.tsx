
import React, { useState } from 'react';
import { Clipboard, Download, Pause, Play, StopCircle, Volume2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { synthesizeSpeech } from '@/services/audioService';
import { useAudio } from '@/hooks/useAudio';

interface MessageActionsProps {
  content: string;
}

const MessageActions: React.FC<MessageActionsProps> = ({ content }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isAudioProcessing, setIsAudioProcessing] = useState(false);
  
  // Fix: Pass undefined as the initial source, then the options object
  const { setBase64Source, play, pause, stop, isPlaying, isPaused, isLoading } = useAudio(undefined, { 
    onEnded: () => {
      console.log("Audio playback completed");
    },
    autoPlay: true
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      toast({ title: "Copiado!", description: "Texto copiado para área de transferência" });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    try {
      const element = document.createElement("a");
      const file = new Blob([content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = "resposta.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast({ title: "Download iniciado!" });
    } catch (error) {
      toast({
        title: "Erro ao baixar",
        description: "Não foi possível baixar o arquivo",
        variant: "destructive",
      });
    }
  };

  const handleToggleAudio = async () => {
    // Se já estiver reproduzindo, pausar o áudio
    if (isPlaying) {
      pause();
      toast({ title: "Áudio pausado", description: "A narração foi pausada" });
      return;
    }
    
    // Se estiver pausado, retomar a reprodução
    if (isPaused) {
      play();
      toast({ title: "Reproduzindo áudio", description: "A narração foi retomada" });
      return;
    }
    
    try {
      setIsAudioProcessing(true);
      toast({ title: "Preparando áudio...", description: "Aguarde enquanto sintetizamos a fala" });
      
      // Log para diagnóstico de performance
      const startTime = Date.now();
      console.log(`[TTS] Iniciando síntese de fala: ${startTime}`, {
        contentLength: content.length,
        timestamp: new Date().toISOString()
      });
      
      // Verifica tamanho do texto antes de enviar
      if (content.length > 4000) {
        console.log(`[TTS] Texto muito longo (${content.length} caracteres). Enviando apenas os primeiros 4000 caracteres.`);
        toast({
          title: "Texto muito longo",
          description: "Sintetizando apenas parte do texto para melhor performance",
        });
        
        // Limita o texto a 4000 caracteres para melhor performance
        const truncatedContent = content.substring(0, 4000);
        const result = await synthesizeSpeech(truncatedContent, {
          voice: "ash",
          model: "tts-1"
        });
        
        if (!result.audio) {
          throw new Error("Não foi possível gerar o áudio");
        }
        
        // Play the audio using our hook
        setBase64Source(result.audio);
        
        const endTime = Date.now();
        console.log(`[TTS] Síntese de fala concluída: ${endTime}`, {
          duration: endTime - startTime,
          responseTime: `${(endTime - startTime)/1000}s`
        });
        
        toast({ 
          title: "Reproduzindo áudio", 
          description: "Apenas uma parte do texto está sendo narrada para melhor performance" 
        });
      } else {
        // Processar o texto normalmente
        const result = await synthesizeSpeech(content, {
          voice: "ash",
          model: "tts-1"
        });
        
        if (!result.audio) {
          throw new Error("Não foi possível gerar o áudio");
        }
        
        // Play the audio using our hook
        setBase64Source(result.audio);
        
        const endTime = Date.now();
        console.log(`[TTS] Síntese de fala concluída: ${endTime}`, {
          duration: endTime - startTime,
          responseTime: `${(endTime - startTime)/1000}s`
        });
        
        toast({ title: "Reproduzindo áudio", description: "A resposta está sendo narrada" });
      }
      
    } catch (error) {
      console.error("Erro ao reproduzir áudio:", error);
      toast({
        title: "Erro ao reproduzir",
        description: error instanceof Error ? error.message : "Não foi possível sintetizar o áudio",
        variant: "destructive",
      });
    } finally {
      setIsAudioProcessing(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleCopy}
        title="Copiar"
      >
        <Clipboard className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleDownload}
        title="Baixar"
      >
        <Download className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleToggleAudio}
        disabled={isAudioProcessing} // Desativado apenas durante processamento
        title={
          isPlaying ? "Pausar narração" : 
          isPaused ? "Continuar narração" : 
          "Ouvir resposta"
        }
      >
        {isPlaying ? (
          <Pause className="h-4 w-4 text-primary" />
        ) : isPaused ? (
          <Play className="h-4 w-4 text-primary" />
        ) : (
          <Volume2 className={`h-4 w-4 ${isAudioProcessing ? 'animate-pulse' : ''}`} />
        )}
      </Button>
    </div>
  );
};

export default MessageActions;
