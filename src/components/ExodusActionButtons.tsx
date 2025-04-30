
import React, { useContext } from "react";
import { BookOpenText, MessageSquare, Grid, Book } from "lucide-react";
import { ChatContext } from "./ActionButtons";
import { useMessageCount } from "@/hooks/useMessageCount";
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

interface ExodusActionButtonsProps {
  displayInModal?: boolean;
}

const ExodusActionButtons = ({ displayInModal = false }: ExodusActionButtonsProps) => {
  const { sendMessage } = useContext(ChatContext);
  const { messageCount, MESSAGE_LIMIT, incrementMessageCount, canSendMessage } = useMessageCount();

  const handleButtonClick = (prompt: string) => {
    if (!canSendMessage) {
      toast({
        title: "Limite de mensagens atingido",
        description: "Você atingiu seu limite mensal de mensagens. Faça upgrade para o plano premium para enviar mais mensagens.",
        variant: "destructive",
      });
      return;
    }
    
    if (sendMessage) {
      sendMessage(prompt);
      // Incrementa o contador de mensagens quando uma sugestão é clicada
      incrementMessageCount();
    }
  };

  // Se não estiver sendo exibido no modal e displayInModal for false, não renderizar nada
  if (!displayInModal) {
    return null;
  }

  const actions = [
    { 
      icon: <BookOpenText className="h-4 w-4 text-purple-400" />, 
      label: "A Libertação",
      prompt: "Como a libertação do Egito em Êxodo serve como modelo de redenção ao longo da narrativa bíblica? (Explora os temas da escravidão, libertação e pacto.)"
    },
    { 
      icon: <MessageSquare className="h-4 w-4 text-blue-400" />, 
      label: "Os 10 Mandamentos",
      prompt: "Qual é o significado dos Dez Mandamentos para a formação da identidade de Israel como nação? (Analise a estrutura e propósito da lei mosaica.)"
    },
    { 
      icon: <Grid className="h-4 w-4 text-green-400" />, 
      label: "O Tabernáculo",
      prompt: "Como o Tabernáculo simboliza a presença de Deus entre seu povo em Êxodo? (Detalhe sua construção, simbolismo e importância teológica.)"
    },
    { 
      icon: <Book className="h-4 w-4 text-yellow-400" />, 
      label: "Moisés",
      prompt: "De que maneira a vida de Moisés exemplifica liderança espiritual em Êxodo? (Explore seu chamado, desafios e crescimento como líder.)"
    },
    { 
      icon: <MessageSquare className="h-4 w-4 text-red-400" />, 
      label: "As Pragas",
      prompt: "Qual o propósito das dez pragas no contexto do confronto entre Deus e os deuses do Egito? (Analise seu significado simbólico e teológico.)"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
      {actions.map((action) => (
        <Card
          key={action.label}
          className="flex flex-col items-center p-4 cursor-pointer border hover:border-[#4483f4] transition-all"
          onClick={() => handleButtonClick(action.prompt)}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {action.icon}
              <span className="font-medium">{action.label}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ExodusActionButtons;
