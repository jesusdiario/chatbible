
import React, { useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send } from 'lucide-react';
import { ChatContext } from "./ActionButtons";
import { useMessageCount } from "@/hooks/useMessageCount";
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

interface Suggestion {
  id: string;
  label: string;
  user_message: string;
  icon: string;
}

interface LeviticusActionButtonsProps {
  displayInModal?: boolean;
}

const LeviticusActionButtons = ({ displayInModal = false }: LeviticusActionButtonsProps) => {
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

  // Se não estiver sendo exibido no modal e displayInModal for false, não renderizar nada
  if (!displayInModal) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {suggestions.map((suggestion) => {
        return (
          <Card
            key={suggestion.id}
            className="flex flex-col items-center p-4 cursor-pointer border hover:border-[#4483f4] transition-all"
            onClick={() => handleButtonClick(suggestion)}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[14px] font-medium">{suggestion.label}</span>
              <Send className="h-4 w-4 text-[#4483f4]" />
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default LeviticusActionButtons;
