
import { useState } from 'react';
import { generateSpeech } from '@/services/ttsService';
import { Volume2 } from "lucide-react";

interface ReadAloudButtonProps {
  text: string;
}

export function ReadAloudButton({ text }: ReadAloudButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePlay = async () => {
    setLoading(true);
    try {
      const base64 = await generateSpeech(text);
      const audioUrl = `data:audio/mp3;base64,${base64}`;
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      // Poderia usar um toast se desejar
      alert("Erro ao reproduzir áudio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePlay}
      disabled={loading}
      className="ml-2 p-2 rounded hover:bg-chatgpt-hover transition"
      aria-label="Ler em voz alta"
      title="Ler em voz alta"
      tabIndex={0}
    >
      {loading ? (
        <span className="animate-pulse text-sm">•••</span>
      ) : (
        <Volume2 size={20} />
      )}
    </button>
  );
}
