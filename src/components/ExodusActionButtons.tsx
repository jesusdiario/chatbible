
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { BookOpen, Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from '@/hooks/useSubscription';
import { useMessageCount } from '@/hooks/useMessageCount';
import SubscriptionModal from './SubscriptionModal';

export const ExodusActionButtons = () => {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { toast } = useToast();
  const { subscribed } = useSubscription();
  const { messageCount, messageLimit, canSendMessage, increment } = useMessageCount();
  
  const handleDownloadButtonClick = async () => {
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
      title: "Download Iniciado",
      description: "Seu download do material de Êxodo começou."
    });
  };
  
  return (
    <div className="flex flex-wrap gap-2 justify-start mt-4">
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={handleDownloadButtonClick}
      >
        <Download size={16} />
        <span className="hidden sm:inline">Baixar material</span>
        <span className="sm:hidden">Baixar</span>
      </Button>
      
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
      >
        <BookOpen size={16} />
        <span className="hidden sm:inline">Ver mais recursos</span>
        <span className="sm:hidden">Recursos</span>
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

export default ExodusActionButtons;
