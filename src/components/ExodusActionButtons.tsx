
import React, { useContext } from 'react';
import { ChatContext } from './ActionButtons';
import { Button } from '@/components/ui/button';
import { FilePieChart, MapPin, Moon, Ship, Mountain } from 'lucide-react';
import { useMessageCount } from '@/hooks/useMessageCount';
import { toast } from '@/components/ui/use-toast';

const ExodusActionButtons = () => {
  const { sendMessage } = useContext(ChatContext);
  const { canSendMessage, increment, messageLimit } = useMessageCount();

  const handleAsk = (question: string) => {
    if (!canSendMessage) {
      toast({
        title: "Limite de mensagens atingido",
        description: "Você atingiu seu limite mensal de mensagens.",
        variant: "destructive",
      });
      return;
    }
    
    if (sendMessage) {
      sendMessage(question);
      increment();
    }
  };

  if (!canSendMessage) {
    return (
      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
        <p className="text-sm text-amber-800 mb-2">
          Você atingiu seu limite de {messageLimit} mensagens para este mês.
        </p>
        <Button size="sm" variant="default" onClick={() => window.location.href = '/profile?tab=subscription'}>
          Fazer upgrade para Premium
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      <Button 
        variant="outline" 
        className="flex items-center gap-2 bg-white" 
        onClick={() => handleAsk("Explique o significado das 10 pragas do Egito em êxodo")}
      >
        <FilePieChart size={16} className="text-blue-500" />
        <span>As 10 Pragas</span>
      </Button>
      
      <Button 
        variant="outline" 
        className="flex items-center gap-2 bg-white" 
        onClick={() => handleAsk("Por que a travessia do Mar Vermelho é importante?")}
      >
        <Ship size={16} className="text-blue-500" />
        <span>Mar Vermelho</span>
      </Button>
      
      <Button 
        variant="outline" 
        className="flex items-center gap-2 bg-white" 
        onClick={() => handleAsk("Explique os Dez Mandamentos em êxodo de forma simples")}
      >
        <Mountain size={16} className="text-blue-500" />
        <span>Os Dez Mandamentos</span>
      </Button>
    </div>
  );
};

export default ExodusActionButtons;
