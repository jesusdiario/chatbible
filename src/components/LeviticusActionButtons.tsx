
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { BookOpen, Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useMessageCount } from '@/hooks/useMessageCount';
import SubscriptionModal from './SubscriptionModal';

export const LeviticusActionButtons = () => {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { toast } = useToast();
  const { subscribed } = useSubscription();
  const { messageCount, messageLimit, canSendMessage, increment } = useMessageCount();

  const handleResourceButtonClick = async () => {
    if (messageCount >= messageLimit && !subscribed) {
      setShowSubscriptionModal(true);
      return;
    }
    
    if (!canSendMessage) {
      toast({
        title: "Limite excedido",
        description: "Você atingiu seu limite mensal de mensagens.",
        variant: "destructive"
      });
      return;
    }
    
    // Track message use
    await increment();
    
    toast({
      title: "Recursos de Levítico",
      description: "Acessando recursos complementares para estudo de Levítico."
    });
  };
  
  return (
    <div className="flex flex-wrap gap-2 justify-start mt-4">
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
      >
        <Download size={16} />
        <span className="hidden sm:inline">Baixar resumo</span>
        <span className="sm:hidden">Baixar</span>
      </Button>
      
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={handleResourceButtonClick}
      >
        <BookOpen size={16} />
        <span className="hidden sm:inline">Material de estudo</span>
        <span className="sm:hidden">Estudar</span>
      </Button>
      
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
      >
        <Share2 size={16} />
        <span className="hidden sm:inline">Compartilhar</span>
        <span className="sm:hidden">Compartilhar</span>
      </Button>
      
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
    </div>
  );
};

export default LeviticusActionButtons;
