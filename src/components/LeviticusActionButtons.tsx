
import React, { useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { icons } from 'lucide-react';
import { ChatContext } from "./ActionButtons";
import { useMessageCount } from "@/hooks/useMessageCount";
import { toast } from "@/hooks/use-toast";

interface Suggestion {
  id: string;
  label: string;
  user_message: string;
  icon: string;
}

const LeviticusActionButtons = () => {
  const { sendMessage } = useContext(ChatContext);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const { messageCount, MESSAGE_LIMIT, incrementMessageCount, canSendMessage } = useMessageCount();

  useEffect(() => {
    const fetchSuggestions = async () => {
      const { data, error } = await supabase
        .from('bible_suggestions')
        .select('*')
        .eq('book_slug', 'levitico')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Erro ao buscar sugestões:', error);
        return;
      }

      setSuggestions(data || []);
    };

    fetchSuggestions();
  }, []);

  const handleButtonClick = (suggestion: Suggestion) => {
    if (!canSendMessage) {
      toast({
        title: "Limite de mensagens atingido",
        description: "Você atingiu seu limite mensal de mensagens. Faça upgrade para o plano premium para enviar mais mensagens.",
        variant: "destructive",
      });
      return;
    }
    
    if (sendMessage) {
      sendMessage(suggestion.user_message);
      // Incrementa o contador de mensagens quando uma sugestão é clicada
      incrementMessageCount();
    }
  };

  return (
    <div className="flex gap-2 flex-wrap justify-center mt-4">
      {suggestions.map((suggestion) => {
        const IconComponent = icons[suggestion.icon as keyof typeof icons];
        return (
          <button 
            key={suggestion.id} 
            className="relative flex h-[42px] items-center gap-1.5 rounded-full border border-[#383737] px-3 py-2 text-start text-[13px] shadow-xxs transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"
            onClick={() => handleButtonClick(suggestion)}
            disabled={!canSendMessage}
          >
            {IconComponent && <IconComponent className="h-4 w-4 text-green-400" />}
            {suggestion.label}
          </button>
        );
      })}
    </div>
  );
};

export default LeviticusActionButtons;
