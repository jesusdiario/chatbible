
import React, { useContext } from "react";
import { BookOpenText, MessageSquare, Grid, Baby, User } from "lucide-react";

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
      label: "Exegese de Capítulo",
      // Este prompt agora informa que o usuário quer usar o WordzGPT para análise bíblica
      prompt: "Por favor, use o WordzGPT (g-Y251NC6Ef-wordzgpt) para fazer uma exegese detalhada do capítulo 5 do livro de Marcos da Bíblia, incluindo contexto histórico, análise do texto original, principais ensinamentos e aplicações para hoje."
    },
    { 
      icon: <MessageSquare className="h-4 w-4 text-blue-400" />, 
      label: "Criar Pregação Expositiva",
      prompt: "Crie uma pregação expositiva baseada em João 3:16, com introdução, desenvolvimento com 3 pontos principais, ilustrações e conclusão."
    },
    { 
      icon: <Grid className="h-4 w-4 text-green-400" />, 
      label: "Estudo para Célula",
      prompt: "Prepare um estudo bíblico para célula sobre o tema 'Frutos do Espírito' de Gálatas 5, com perguntas para discussão, aplicação prática e oração final."
    },
    { 
      icon: <Baby className="h-4 w-4 text-yellow-400" />, 
      label: "Explicar para Crianças",
      prompt: "Explique a história da Arca de Noé de uma forma simples para crianças de 5 a 8 anos, incluindo lições que elas podem aprender."
    },
    { 
      icon: <User className="h-4 w-4 text-red-400" />, 
      label: "Atividade Infantil",
      prompt: "Crie uma atividade infantil para ensinar a história de Davi e Golias para crianças entre 6 e 10 anos, com perguntas e um jogo ou dinâmica relacionada."
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
