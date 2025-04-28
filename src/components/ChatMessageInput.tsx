import React, { useState, useEffect, useRef } from "react";
import { ArrowUp, Loader2, Mic, StopCircle } from "lucide-react";
import { transcribeAudio } from "@/services/audioService"; // Importar o serviço de áudio
import { useToast } from "@/hooks/use-toast";

interface ChatMessageInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  bookSlug?: string;
}

const ChatMessageInput = ({
  onSend,
  isLoading,
  disabled,
  bookSlug,
}: ChatMessageInputProps) => {
  const [message, setMessage] = useState("");
  const [placeholder, setPlaceholder] = useState("Sua dúvida bíblica");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (bookSlug) {
      const formattedBookName =
        bookSlug.charAt(0).toUpperCase() + bookSlug.slice(1);
      setPlaceholder(`Pergunte algo sobre ${formattedBookName}...`);
    } else {
      setPlaceholder("Sua dúvida bíblica");
    }
  }, [bookSlug]);

  const handleTextSubmit = () => {
    if (message.trim() && !isLoading && !disabled && !isRecording && !isTranscribing) {
      onSend(message);
      setMessage("");
      // Reset textarea height after sending
      const textarea = document.getElementById("chat-textarea") as HTMLTextAreaElement;
      if (textarea) {
        textarea.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading && !disabled && !isRecording && !isTranscribing) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    setMessage(target.value);
    // Auto-resize textarea
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
  };

  // --- Funções de Gravação de Áudio ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "audio/webm" }); // Use webm for better compatibility
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setIsRecording(false);
        setIsTranscribing(true);
        toast({ title: "Processando áudio..." });
        const result = await transcribeAudio(audioBlob);
        setIsTranscribing(false);
        if (result.success && result.text) {
          setMessage((prev) => (prev ? prev + " " + result.text : result.text));
          // Trigger resize after setting message
          const textarea = document.getElementById("chat-textarea") as HTMLTextAreaElement;
          if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
            textarea.focus();
          }
          toast({ title: "Áudio transcrito!" });
        } else {
          toast({
            title: "Erro na transcrição",
            description: result.error || "Não foi possível transcrever o áudio.",
            variant: "destructive",
          });
        }
        // Stop media stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({ title: "Gravando áudio...", description: "Clique no botão novamente para parar." });
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
      toast({
        title: "Erro de Gravação",
        description: "Não foi possível acessar o microfone. Verifique as permissões.",
        variant: "destructive",
      });
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      // Tracks are stopped in onstop handler
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const isSendDisabled = isLoading || !message.trim() || disabled || isRecording || isTranscribing;
  const isMicDisabled = isLoading || disabled || isTranscribing;

  return (
    <div className="relative w-full flex items-end gap-2">
      <textarea
        id="chat-textarea" // Add id for easier targeting
        rows={1}
        value={message}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-400/50 transition-all duration-200 text-black" // Adjusted styling
        style={{ maxHeight: "200px", overflowY: "auto" }} // Ensure scrollbar appears if needed
        disabled={isLoading || disabled || isRecording || isTranscribing}
        aria-label="Campo de mensagem"
      />
      {/* Botão de Microfone */}
      <button
        onClick={handleMicClick}
        disabled={isMicDisabled}
        className={`p-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${isRecording ? "bg-red-100 hover:bg-red-200" : "bg-white"}`}
        aria-label={isRecording ? "Parar gravação" : "Iniciar gravação"}
      >
        {isRecording ? (
          <StopCircle className="h-5 w-5 text-red-600" />
        ) : isTranscribing ? (
          <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />
        ) : (
          <Mic className="h-5 w-5 text-gray-600" />
        )}
      </button>
      {/* Botão de Enviar */}
      <button
        onClick={handleTextSubmit}
        disabled={isSendDisabled}
        className={`p-2.5 bg-black rounded-lg text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${isLoading ? "animate-pulse" : ""}`}
        aria-label="Enviar mensagem"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <ArrowUp className="h-5 w-5" />
        )}
      </button>
    </div>
  );
};

export default ChatMessageInput;
