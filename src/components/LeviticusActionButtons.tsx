
import React, { useContext } from 'react';
import { ChatContext } from './ActionButtons';
import { Button } from '@/components/ui/button';
import { Flame, Droplets, Pizza, HeartHandshake, Calendar } from 'lucide-react';
import { useMessageCount } from '@/hooks/useMessageCount';
import { toast } from '@/components/ui/use-toast';
import { useSubscription } from '@/hooks/useSubscription';

interface LeviticusActionButtonsProps {
  inline?: boolean;
}

const LeviticusActionButtons: React.FC<LeviticusActionButtonsProps> = ({ inline = false }) => {
  const { sendMessage } = useContext(ChatContext);
  const { canSendMessage, increment, messageLimit } = useMessageCount();
  const { startCheckout } = useSubscription();

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
  
  const handleUpgradeClick = () => {
    startCheckout('price_1OeVptLyyMwTutR9oFF1m3aC');
  };

  if (!canSendMessage) {
    return (
      <div className={`${inline ? "" : "mt-4"} p-4 bg-amber-50 border border-amber-200 rounded-lg text-center`}>
        <p className="text-sm text-amber-800 mb-2">
          Você atingiu seu limite de {messageLimit} mensagens para este mês.
        </p>
        <Button size="sm" variant="default" onClick={handleUpgradeClick}>
          Fazer upgrade para Premium
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${inline ? "" : "justify-center mt-4"}`}>
      <Button 
        variant="outline" 
        className="flex items-center gap-2 bg-white" 
        onClick={() => handleAsk("Explique o sistema de sacrifícios em Levítico e seu significado")}
        size={inline ? "sm" : "default"}
      >
        <Flame size={16} className="text-red-500" />
        <span>Sacrifícios</span>
      </Button>
      
      <Button 
        variant="outline" 
        className="flex items-center gap-2 bg-white" 
        onClick={() => handleAsk("Quais eram as leis de pureza em Levítico e o que significam para nós hoje?")}
        size={inline ? "sm" : "default"}
      >
        <Droplets size={16} className="text-blue-500" />
        <span>Leis de Pureza</span>
      </Button>
      
      <Button 
        variant="outline" 
        className="flex items-center gap-2 bg-white" 
        onClick={() => handleAsk("Por que existem restrições alimentares em Levítico?")}
        size={inline ? "sm" : "default"}
      >
        <Pizza size={16} className="text-green-500" />
        <span>Leis Alimentares</span>
      </Button>
      
      {!inline && (
        <>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-white" 
            onClick={() => handleAsk("O que era o Dia da Expiação em Levítico?")}
          >
            <Calendar size={16} className="text-purple-500" />
            <span>Dia da Expiação</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-white" 
            onClick={() => handleAsk("Quais são os princípios morais em Levítico que ainda se aplicam hoje?")}
          >
            <HeartHandshake size={16} className="text-pink-500" />
            <span>Princípios Morais</span>
          </Button>
        </>
      )}
    </div>
  );
};

export default LeviticusActionButtons;
