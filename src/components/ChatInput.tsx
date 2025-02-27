
import { useState, useEffect } from "react";
import { ArrowUp, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SubscriptionModal from "@/components/SubscriptionModal";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

const ChatInput = ({ onSend, isLoading = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [messageCount, setMessageCount] = useState(0);
  const [timeUntilReset, setTimeUntilReset] = useState(0);
  const [isLimited, setIsLimited] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { toast } = useToast();
  
  // Configurações de limite
  const MESSAGE_LIMIT = 10; // Número máximo de mensagens permitidas
  const RESET_TIME = 30 * 24 * 60 * 60 * 1000; // Tempo de reset em milissegundos (30 dias)
  
  useEffect(() => {
    // Carregar o contador de mensagens e o timestamp do último reset do localStorage
    const loadMessageLimit = () => {
      const storedCount = localStorage.getItem('messageCount');
      const storedTimestamp = localStorage.getItem('lastResetTime');
      
      if (storedCount && storedTimestamp) {
        const count = parseInt(storedCount);
        const timestamp = parseInt(storedTimestamp);
        const currentTime = Date.now();
        const timeElapsed = currentTime - timestamp;
        
        // Se já passou o tempo de reset, zerar o contador
        if (timeElapsed >= RESET_TIME) {
          setMessageCount(0);
          localStorage.setItem('messageCount', '0');
          localStorage.setItem('lastResetTime', currentTime.toString());
        } else {
          // Caso contrário, atualizar o contador e o tempo restante
          setMessageCount(count);
          setTimeUntilReset(RESET_TIME - timeElapsed);
          
          // Verificar se o usuário atingiu o limite
          if (count >= MESSAGE_LIMIT) {
            setIsLimited(true);
          }
        }
      } else {
        // Inicializar os valores se não existirem
        localStorage.setItem('messageCount', '0');
        localStorage.setItem('lastResetTime', Date.now().toString());
      }
    };
    
    loadMessageLimit();
    
    // Atualizar o temporizador a cada minuto (não precisamos atualizar por segundo para um período tão longo)
    const intervalId = setInterval(() => {
      if (timeUntilReset > 0) {
        setTimeUntilReset(prev => {
          const newTime = prev - 60000; // Atualiza a cada minuto
          if (newTime <= 0) {
            setIsLimited(false);
            setMessageCount(0);
            localStorage.setItem('messageCount', '0');
            localStorage.setItem('lastResetTime', Date.now().toString());
            return 0;
          }
          return newTime;
        });
      }
    }, 60000); // Atualiza a cada minuto
    
    return () => clearInterval(intervalId);
  }, []);
  
  const formatTimeRemaining = (milliseconds: number) => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  const handleSubscriptionPrompt = () => {
    setShowSubscriptionModal(true);
  };

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      // Verificar se o usuário atingiu o limite de mensagens
      if (messageCount >= MESSAGE_LIMIT || isLimited) {
        setIsLimited(true);
        handleSubscriptionPrompt();
        toast({
          title: "Limite de mensagens atingido",
          description: `Você atingiu o limite de ${MESSAGE_LIMIT} mensagens por mês. Considere fazer upgrade para o plano premium.`,
          variant: "destructive"
        });
        return;
      }
      
      // Incrementar o contador de mensagens
      const newCount = messageCount + 1;
      setMessageCount(newCount);
      localStorage.setItem('messageCount', newCount.toString());
      
      // Se esta for a primeira mensagem, armazenar o timestamp
      if (messageCount === 0) {
        localStorage.setItem('lastResetTime', Date.now().toString());
      }
      
      // Verificar se atingiu o limite após esta mensagem
      if (newCount >= MESSAGE_LIMIT) {
        setIsLimited(true);
        handleSubscriptionPrompt(); // Abrir modal de assinatura quando atingir o limite
      }
      
      // Enviar a mensagem
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative flex w-full flex-col items-center">
      {isLimited && (
        <div 
          className="w-full mb-2 px-3 py-2 text-sm bg-amber-900/30 text-amber-200 rounded-md flex items-center cursor-pointer hover:bg-amber-900/40"
          onClick={handleSubscriptionPrompt}
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>
            Limite de mensagens atingido. Clique aqui para fazer upgrade.
          </span>
        </div>
      )}
      <div className="relative w-full">
        <textarea
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Sua dúvida bíblica"
          className="w-full resize-none rounded-full bg-[#2F2F2F] px-4 py-4 pr-12 focus:outline-none"
          style={{ maxHeight: "200px" }}
          disabled={isLoading || isLimited}
        />
        <button 
          onClick={handleSubmit}
          disabled={isLoading || !message.trim() || isLimited}
          className="absolute right-3 top-[50%] -translate-y-[50%] p-1.5 bg-white rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-black animate-spin" />
          ) : (
            <ArrowUp className="h-4 w-4 text-black" />
          )}
        </button>
      </div>
      <div 
        className="w-full text-xs text-gray-500 mt-1 text-right cursor-pointer hover:underline"
        onClick={isLimited ? handleSubscriptionPrompt : undefined}
      >
        {messageCount}/{MESSAGE_LIMIT} mensagens enviadas
        {isLimited && " - Clique para fazer upgrade"}
      </div>
      
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
    </div>
  );
};

export default ChatInput;
