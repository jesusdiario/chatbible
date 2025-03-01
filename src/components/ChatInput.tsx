
import { useState, useEffect } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SubscriptionModal from "@/components/SubscriptionModal";
import { supabase } from "@/integrations/supabase/client";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

interface MessageCount {
  id: string;
  user_id: string;
  count: number;
  last_reset_time: string;
  created_at: string;
  updated_at: string;
}

const ChatInput = ({ onSend, isLoading = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [messageCount, setMessageCount] = useState(0);
  const [timeUntilReset, setTimeUntilReset] = useState(0);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Configurações de limite
  const MESSAGE_LIMIT = 10; // Número máximo de mensagens permitidas
  const RESET_TIME = 30 * 24 * 60 * 60 * 1000; // Tempo de reset em milissegundos (30 dias)
  
  useEffect(() => {
    // Função para buscar ou criar o contador de mensagens do usuário
    const fetchOrCreateMessageCount = async () => {
      try {
        setLoading(true);
        
        // Verificar se o usuário está autenticado
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("Usuário não autenticado");
          setLoading(false);
          return;
        }
        
        const userId = session.user.id;
        
        // Buscar o contador de mensagens do usuário
        const { data: messageCountData, error: fetchError } = await supabase
          .from('message_counts')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (fetchError) {
          console.error("Erro ao buscar contador de mensagens:", fetchError);
          setLoading(false);
          return;
        }
        
        // Se não existir um registro, criar um novo
        if (!messageCountData) {
          const { data: newData, error: insertError } = await supabase
            .from('message_counts')
            .insert([{ 
              user_id: userId, 
              count: 0, 
              last_reset_time: new Date().toISOString() 
            }])
            .select()
            .single();
          
          if (insertError) {
            console.error("Erro ao criar contador de mensagens:", insertError);
            setLoading(false);
            return;
          }
          
          if (newData) {
            setMessageCount(0);
            setTimeUntilReset(RESET_TIME);
          }
        } else {
          // Verificar se é hora de resetar o contador
          const lastResetTime = new Date(messageCountData.last_reset_time).getTime();
          const currentTime = Date.now();
          const timeElapsed = currentTime - lastResetTime;
          
          if (timeElapsed >= RESET_TIME) {
            // Resetar o contador
            const { error: updateError } = await supabase
              .from('message_counts')
              .update({ 
                count: 0, 
                last_reset_time: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('user_id', userId);
            
            if (updateError) {
              console.error("Erro ao resetar contador de mensagens:", updateError);
            }
            
            setMessageCount(0);
            setTimeUntilReset(RESET_TIME);
          } else {
            // Atualizar o contador e o tempo restante
            setMessageCount(messageCountData.count);
            setTimeUntilReset(RESET_TIME - timeElapsed);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erro ao processar contador de mensagens:", error);
        setLoading(false);
      }
    };
    
    fetchOrCreateMessageCount();
    
    // Atualizar o temporizador a cada minuto
    const intervalId = setInterval(() => {
      if (timeUntilReset > 0) {
        setTimeUntilReset(prev => {
          const newTime = prev - 60000;
          if (newTime <= 0) {
            fetchOrCreateMessageCount(); // Recarregar dados quando o timer zerar
            return 0;
          }
          return newTime;
        });
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = async () => {
    if (message.trim() && !isLoading && !loading) {
      try {
        // Verificar se o usuário está autenticado
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("Usuário não autenticado");
          return;
        }
        
        const userId = session.user.id;
        
        // Verificar se o usuário atingiu o limite de mensagens
        if (messageCount >= MESSAGE_LIMIT) {
          setShowSubscriptionModal(true);
          toast({
            title: "Limite de mensagens atingido",
            description: `Você atingiu o limite de ${MESSAGE_LIMIT} mensagens mensais. Faça upgrade para o plano premium.`,
          });
          return;
        }
        
        // Incrementar o contador de mensagens
        const newCount = messageCount + 1;
        const { error } = await supabase
          .from('message_counts')
          .update({ 
            count: newCount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        
        if (error) {
          console.error("Erro ao atualizar contador de mensagens:", error);
          toast({
            title: "Erro",
            description: "Ocorreu um erro ao processar sua mensagem. Tente novamente.",
            variant: "destructive"
          });
          return;
        }
        
        setMessageCount(newCount);
        
        // Verificar se atingiu o limite após esta mensagem
        if (newCount >= MESSAGE_LIMIT) {
          setShowSubscriptionModal(true);
          toast({
            title: "Limite de mensagens atingido",
            description: `Você atingiu o limite de ${MESSAGE_LIMIT} mensagens mensais. Faça upgrade para o plano premium.`,
          });
        }
        
        // Enviar a mensagem
        onSend(message);
        setMessage("");
      } catch (error) {
        console.error("Erro ao processar envio de mensagem:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao enviar sua mensagem. Tente novamente.",
          variant: "destructive"
        });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && !loading) {
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
          disabled={isLoading || loading}
        />
        <button 
          onClick={handleSubmit}
          disabled={isLoading || !message.trim() || loading}
          className="absolute right-3 top-[50%] -translate-y-[50%] p-1.5 bg-white rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading || loading ? (
            <Loader2 className="h-4 w-4 text-black animate-spin" />
          ) : (
            <ArrowUp className="h-4 w-4 text-black" />
          )}
        </button>
      </div>
      
      {!loading && (
        <div className="w-full text-xs text-gray-500 mt-1 text-right">
          {messageCount}/{MESSAGE_LIMIT} mensagens enviadas este mês
        </div>
      )}
      
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
    </div>
  );
};

export default ChatInput;
