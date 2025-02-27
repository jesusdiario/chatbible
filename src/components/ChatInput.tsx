
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
    
    // Atualizar o temporizador a cada minuto
    const intervalId = setInterval(() => {
      if (timeUntilReset > 0) {
        setTimeUntilReset(prev => {
          const newTime = prev - 60000;
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
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      setShowSubscriptionModal(true);
      toast({
        title: "Faça upgrade do plano",
        description: "Faça upgrade para o plano premium para enviar mensagens.",
      });
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
      <div className="relative w-full">
        <textarea
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Sua dúvida bíblica"
          className="w-full resize-none rounded-full bg-[#2F2F2F] px-4 py-4 pr-12 focus:outline-none"
          style={{ maxHeight: "200px" }}
          disabled={isLoading}
        />
        <button 
          onClick={handleSubmit}
          disabled={isLoading || !message.trim()}
          className="absolute right-3 top-[50%] -translate-y-[50%] p-1.5 bg-white rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-black animate-spin" />
          ) : (
            <ArrowUp className="h-4 w-4 text-black" />
          )}
        </button>
      </div>
      
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
    </div>
  );
};

export default ChatInput;
