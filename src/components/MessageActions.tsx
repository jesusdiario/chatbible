
import { Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface MessageActionsProps {
  content?: string;
}

const MessageActions = ({ content = "" }: MessageActionsProps) => {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copiado para a área de transferência",
        description: "O conteúdo foi copiado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o conteúdo.",
        variant: "destructive",
      });
    }
  };

  const handleFeedback = (type: "like" | "dislike") => {
    // Se o usuário clica no mesmo feedback, remove-o
    if (feedback === type) {
      setFeedback(null);
      toast({
        title: "Feedback removido",
        description: "Seu feedback foi removido.",
      });
      // Aqui poderia ter um envio para a API da OpenAI removendo o feedback
    } else {
      setFeedback(type);
      toast({
        title: "Obrigado pelo feedback!",
        description: `Sua ${type === "like" ? "aprovação" : "sugestão de melhoria"} foi registrada.`,
      });
      
      // Envio de feedback para a API da OpenAI
      // Esta é uma simulação do envio - em um ambiente real seria uma chamada à API
      console.log(`Feedback enviado para OpenAI: ${type} para a mensagem`);
      // Exemplo de como seria o corpo da requisição:
      // {
      //   message_id: message.id,
      //   rating: type === "like" ? "up" : "down",
      //   api_key: apiKey
      // }
    }
  };

  return (
    <div className="flex items-center gap-2 text-gray-400">
      <button 
        onClick={handleCopy}
        className="p-1 hover:bg-gray-700 rounded-md transition-colors"
        aria-label="Copiar mensagem"
      >
        <Copy className="h-4 w-4" />
      </button>
      
      <button 
        onClick={() => handleFeedback("like")}
        className={`p-1 hover:bg-gray-700 rounded-md transition-colors ${feedback === "like" ? "text-green-500" : ""}`}
        aria-label="Mensagem útil"
      >
        <ThumbsUp className="h-4 w-4" />
      </button>
      
      <button 
        onClick={() => handleFeedback("dislike")}
        className={`p-1 hover:bg-gray-700 rounded-md transition-colors ${feedback === "dislike" ? "text-red-500" : ""}`}
        aria-label="Mensagem não útil"
      >
        <ThumbsDown className="h-4 w-4" />
      </button>
    </div>
  );
};

export default MessageActions;
