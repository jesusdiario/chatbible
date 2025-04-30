
import React, { useState, useEffect } from 'react';
import { Clipboard, Download, Volume2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { synthesizeSpeech } from '@/services/audioService';
import AudioPlayerModal from './AudioPlayerModal';
import { supabase } from '@/integrations/supabase/client';

interface MessageActionsProps {
  content: string;
  tokenCount?: number;
  model?: string;
}

const MessageActions: React.FC<MessageActionsProps> = ({ 
  content, 
  tokenCount,
  model = "gpt-3.5-turbo" 
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | undefined>();

  // Token tracking - estima aproximadamente o número de tokens no texto
  const estimatedTokenCount = Math.ceil(content.length / 4);

  // Rastrear uso do modelo de síntese de voz quando o áudio é gerado
  useEffect(() => {
    const trackAudioUsage = async () => {
      if (isAudioModalOpen && audioBase64) {
        try {
          const session = await supabase.auth.getSession();
          if (session?.data?.session) {
            await supabase.functions.invoke('track-usage', {
              body: {
                endpoint: 'tts-1',
                model: 'tts-1',
                promptTokens: Math.ceil(content.length / 4),
                completionTokens: 0,
                totalTokens: Math.ceil(content.length / 4)
              }
            });
          }
        } catch (error) {
          console.error('Erro ao rastrear uso de TTS:', error);
        }
      }
    };

    trackAudioUsage();
  }, [audioBase64, isAudioModalOpen, content.length]);

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

  const handleAudioPlay = async () => {
    setIsAudioModalOpen(true);
    
    // If we already have the audio, don't re-fetch it
    if (audioBase64) return;
    
    setIsAudioLoading(true);
    
    try {
      // Verifica tamanho do texto antes de enviar
      if (content.length > 16000) {
        toast({
          title: "Texto muito longo",
          description: "Este texto é muito extenso para ser convertido em áudio. Por favor, tente com uma resposta menor.",
          variant: "destructive",
        });
        setIsAudioLoading(false);
        setIsAudioModalOpen(false);
        return;
      }
      
      const result = await synthesizeSpeech(content, {
        voice: "ash",
        model: "tts-1"
      });
      
      if (!result.audio) {
        throw new Error("Não foi possível gerar o áudio");
      }
      
      setAudioBase64(result.audio);
      
    } catch (error) {
      console.error("Erro ao reproduzir áudio:", error);
      toast({
        title: "Erro ao reproduzir",
        description: error instanceof Error ? error.message : "Não foi possível sintetizar o áudio",
        variant: "destructive",
      });
      setIsAudioModalOpen(false);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handleCloseAudioModal = () => {
    setIsAudioModalOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2 mt-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 transition-all duration-200 hover:bg-gray-100"
          onClick={handleCopy}
          title="Copiar"
        >
          <Clipboard className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 transition-all duration-200 hover:bg-gray-100"
          onClick={handleDownload}
          title="Baixar"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 transition-all duration-200 hover:bg-gray-100"
          onClick={handleAudioPlay}
          title="Ouvir resposta"
        >
          <Volume2 className={`h-4 w-4 ${isAudioLoading ? 'animate-pulse' : ''}`} />
        </Button>
      </div>
      
      <AudioPlayerModal 
        isOpen={isAudioModalOpen} 
        onClose={handleCloseAudioModal} 
        audioBase64={audioBase64}
        isLoading={isAudioLoading}
      />
    </>
  );
};

export default MessageActions;
