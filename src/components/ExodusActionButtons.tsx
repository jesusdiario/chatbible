
import React, { useContext } from "react";
import { BookOpenText, MessageSquare, Grid, Book } from "lucide-react";
import { ChatContext } from "./ActionButtons";

const ExodusActionButtons = () => {
  const { sendMessage } = useContext(ChatContext);

  const handleButtonClick = (prompt: string) => {
    if (sendMessage) {
      sendMessage(prompt);
    }
  };

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
    <div className="flex gap-2 flex-wrap justify-center mt-4">
      {actions.map((action) => (
        <button 
          key={action.label} 
          className="relative flex h-[42px] items-center gap-1.5 rounded-full border border-[#383737] px-3 py-2 text-start text-[13px] shadow-xxs transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"
          onClick={() => handleButtonClick(action.prompt)}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default ExodusActionButtons;
