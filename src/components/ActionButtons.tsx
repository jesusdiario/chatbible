import React, { useContext } from "react";
import { BookOpenText, MessageSquare, Grid, Book, User } from "lucide-react";

// Criando um contexto para expor a função de envio de mensagem
export interface ChatContext {
  sendMessage?: (content: string) => void;
}

// Use este contexto onde você precisa acessar a função sendMessage
export const ChatContext = React.createContext<ChatContext>({});

const ActionButtons = () => {
  const { sendMessage } = useContext(ChatContext);

  const handleButtonClick = (prompt: string) => {
    if (sendMessage) {
      sendMessage(prompt);
    }
  };

  const actions = [
    { 
      icon: <BookOpenText className="h-4 w-4 text-purple-400" />, 
      label: "Caráter de Deus",
      prompt: "O que o livro de Gênesis revela sobre o caráter de Deus como Criador, Juiz e Redentor? Por favor, explore os atributos de Deus desde a criação até a aliança com Abraão."
    },
    { 
      icon: <MessageSquare className="h-4 w-4 text-blue-400" />, 
      label: "Natureza Humana",
      prompt: "Como os primeiros capítulos de Gênesis moldam nossa compreensão sobre a natureza humana, o pecado e a responsabilidade diante de Deus? Foque especialmente em Gênesis 1-3 e sua importância para a antropologia bíblica."
    },
    { 
      icon: <Grid className="h-4 w-4 text-green-400" />, 
      label: "Promessa Abraâmica",
      prompt: "De que maneira a promessa feita a Abraão em Gênesis 12:1-3 é o ponto de partida para toda a história da redenção? Por favor, relacione a narrativa patriarcal com o plano messiânico."
    },
    { 
      icon: <Book className="h-4 w-4 text-yellow-400" />, 
      label: "História de José",
      prompt: "Como a história de José no Egito revela a soberania de Deus mesmo em meio a circunstâncias adversas? Analise Gênesis 37-50 e mostre como a providência divina se manifesta nos detalhes."
    },
    { 
      icon: <MessageSquare className="h-4 w-4 text-red-400" />, 
      label: "Os Patriarcas",
      prompt: "Quais padrões de fé, obediência e falha podem ser observados nos patriarcas: Abraão, Isaque e Jacó? Explore os temas de confiança, disciplina e graça nas suas vidas."
    },
    { 
      icon: <BookOpenText className="h-4 w-4 text-indigo-400" />, 
      label: "Bênção e Maldição",
      prompt: "Qual é o significado da bênção e da maldição em Gênesis, e como elas apontam para realidades espirituais maiores? Analise estes temas desde o Éden até os descendentes de Noé."
    },
    { 
      icon: <Grid className="h-4 w-4 text-orange-400" />, 
      label: "Relato da Criação",
      prompt: "De que forma o relato da criação em Gênesis 1 e 2 se distingue de outros relatos antigos e o que isso ensina sobre o propósito da humanidade? Compare as cosmovisões e explique o valor único do ser humano."
    },
    { 
      icon: <Book className="h-4 w-4 text-pink-400" />, 
      label: "Torre de Babel",
      prompt: "O que a Torre de Babel nos ensina sobre orgulho, linguagem e a necessidade da intervenção divina? Explique os limites da autonomia humana sem Deus."
    },
    { 
      icon: <MessageSquare className="h-4 w-4 text-teal-400" />, 
      label: "Efeitos do Pecado",
      prompt: "Como o pecado afeta não apenas o indivíduo, mas famílias, cidades e nações ao longo do livro de Gênesis? Analise desde Adão até Sodoma, mostrando como as consequências do pecado se espalham."
    },
    { 
      icon: <BookOpenText className="h-4 w-4 text-violet-400" />, 
      label: "Cristo em Gênesis",
      prompt: "Onde vemos Cristo prefigurado ou tipificado no livro de Gênesis? Analise exemplos como o descendente prometido à mulher, Melquisedeque, o sacrifício de Isaque e José como tipo de Cristo."
    },
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

export default ActionButtons;
