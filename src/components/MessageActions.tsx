
import React, { useState } from 'react';
import { Clipboard, Download, Volume2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { synthesizeSpeech } from '@/services/audioService';
import { useAudio } from '@/hooks/useAudio';

interface MessageActionsProps {
  content: string;
}

const MessageActions: React.FC<MessageActionsProps> = ({ content }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const { setBase64Source } = useAudio({ 
    onEnded: () => setIsPlayingAudio(false)
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

  const handlePlayAudio = async () => {
    try {
      setIsPlayingAudio(true);
      toast({ title: "Preparando áudio...", description: "Aguarde enquanto sintetizamos a fala" });
      
      // Limit text length to prevent issues with large messages
      const textToSynthesize = content.length > 4000 
        ? content.substring(0, 4000) + "... (texto completo disponível para leitura)"
        : content;
      
      const result = await synthesizeSpeech(textToSynthesize);
      
      // Play the audio using our hook
      setBase64Source(result.audio);
      
    } catch (error) {
      console.error("Erro ao reproduzir áudio:", error);
      toast({
        title: "Erro ao reproduzir",
        description: "Não foi possível sintetizar o áudio",
        variant: "destructive",
      });
      setIsPlayingAudio(false);
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
        onClick={handlePlayAudio}
        disabled={isPlayingAudio}
        title="Ouvir resposta"
      >
        <Volume2 className={`h-4 w-4 ${isPlayingAudio ? 'text-primary animate-pulse' : ''}`} />
      </Button>
    </div>
  );
};

export default MessageActions;
