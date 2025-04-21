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
    const fetchOrCreateMessageCount = async () => {
      try {
        setLoading(true);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }
        const userId = session.user.id;

        // Busca ou cria registro em message_counts
        const { data, error } = await supabase
          .from('message_counts' as any)
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          setLoading(false);
          return;
        }

        if (!data) {
          const { data: newData, error: insertError } = await supabase
            .from('message_counts' as any)
            .insert([{ user_id: userId, count: 0, last_reset_time: new Date().toISOString() }])
            .select()
            .single();

          if (insertError) {
            setLoading(false);
            return;
          }
          setMessageCount(0);
        } else {
          // Resetar se completou período
          const lastResetTime = new Date(data.last_reset_time).getTime();
          const currentTime = Date.now();
          const timeElapsed = currentTime - lastResetTime;

          if (timeElapsed >= RESET_TIME) {
            await supabase
              .from('message_counts' as any)
              .update({
                count: 0,
                last_reset_time: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('user_id', userId);
            setMessageCount(0);
            setTimeUntilReset(RESET_TIME);
          } else {
            setMessageCount(data.count);
            setTimeUntilReset(RESET_TIME - timeElapsed);
          }
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchOrCreateMessageCount();

    // Atualiza temporizador (a cada minuto)
    const intervalId = setInterval(() => {
      if (timeUntilReset > 0) {
        setTimeUntilReset(prev => {
          const newTime = prev - 60000;
          if (newTime <= 0) {
            fetchOrCreateMessageCount();
            return 0;
          }
          return newTime;
        });
      }
    }, 60000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line
  }, []);

  const handleSubmit = async () => {
    if (message.trim() && !isLoading && !loading) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const userId = session.user.id;
        if (messageCount >= MESSAGE_LIMIT) {
          setShowSubscriptionModal(true);
          toast({
            title: "Limite de mensagens atingido",
            description: `Você atingiu o limite de ${MESSAGE_LIMIT} mensagens mensais. Faça upgrade para o plano premium.`,
          });
          return;
        }

        const newCount = messageCount + 1;
        const { error } = await supabase
          .from('message_counts' as any)
          .update({
            count: newCount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) {
          toast({
            title: "Erro",
            description: "Ocorreu um erro ao processar sua mensagem.",
            variant: "destructive"
          });
          return;
        }

        setMessageCount(newCount);

        if (newCount >= MESSAGE_LIMIT) {
          setShowSubscriptionModal(true);
          toast({
            title: "Limite de mensagens atingido",
            description: `Você atingiu o limite de ${MESSAGE_LIMIT} mensagens mensais. Faça upgrade para o plano premium.`,
          });
        }

        onSend(message);
        setMessage("");
      } catch (error) {
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
