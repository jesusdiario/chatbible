
import React, { useContext } from "react";
import { Book, MessageSquare, Cross, Bible, CircleQuestion } from "lucide-react";
import { ChatContext } from "./ActionButtons";

const LeviticusActionButtons = () => {
  const { sendMessage } = useContext(ChatContext);

  const handleButtonClick = (prompt: string) => {
    if (sendMessage) {
      sendMessage(prompt);
    }
  };

  const actions = [
    {
      icon: <Book className="h-4 w-4 text-purple-400" />,
      label: "Por que tantas leis?",
      prompt: "Explique por que Deus deu tantas leis em Levítico e qual o propósito delas."
    },
    {
      icon: <Cross className="h-4 w-4 text-blue-400" />,
      label: "O que é ser santo?",
      prompt: "O que significa ser santo em Levítico? Como aplico isso hoje?"
    },
    {
      icon: <Cross className="h-4 w-4 text-green-400" />,
      label: "Jesus em Levítico?",
      prompt: "Como o livro de Levítico aponta para Jesus Cristo?"
    },
    {
      icon: <Bible className="h-4 w-4 text-red-400" />,
      label: "Sangue e sacrifícios",
      prompt: "Por que o sangue é tão importante em Levítico?"
    },
    {
      icon: <MessageSquare className="h-4 w-4 text-yellow-400" />,
      label: "Pureza ritual x moral",
      prompt: "Qual a diferença entre pureza ritual e pureza moral em Levítico?"
    },
    {
      icon: <Bible className="h-4 w-4 text-indigo-400" />,
      label: "Dia da Expiação",
      prompt: "Explique o significado do Dia da Expiação em Levítico 16."
    },
    {
      icon: <CircleQuestion className="h-4 w-4 text-teal-400" />,
      label: "Alimentos proibidos",
      prompt: "Por que havia alimentos impuros em Levítico? Isso vale hoje?"
    },
    {
      icon: <Book className="h-4 w-4 text-pink-400" />,
      label: "Levítico é relevante?",
      prompt: "Por que devo estudar Levítico hoje em dia?"
    },
    {
      icon: <Cross className="h-4 w-4 text-orange-400" />,
      label: "Deus entre o povo",
      prompt: "O que Levítico ensina sobre a presença de Deus entre seu povo?"
    },
    {
      icon: <Bible className="h-4 w-4 text-purple-400" />,
      label: "Tipos de sacrifícios",
      prompt: "Qual a diferença entre os tipos de sacrifícios em Levítico?"
    },
    {
      icon: <MessageSquare className="h-4 w-4 text-blue-400" />,
      label: "Levítico e evangelho",
      prompt: "Como o evangelho está presente no livro de Levítico?"
    },
    {
      icon: <CircleQuestion className="h-4 w-4 text-green-400" />,
      label: "Custo do pecado",
      prompt: "O que Levítico mostra sobre o peso do pecado diante de Deus?"
    },
    {
      icon: <Book className="h-4 w-4 text-yellow-400" />,
      label: "Papel dos levitas",
      prompt: "Qual o papel dos levitas e sacerdotes em Levítico?"
    },
    {
      icon: <Cross className="h-4 w-4 text-indigo-400" />,
      label: "Lições do altar",
      prompt: "O que o altar representa em Levítico e o que isso ensina para nós?"
    },
    {
      icon: <Bible className="h-4 w-4 text-teal-400" />,
      label: "Festas bíblicas",
      prompt: "Quais festas são descritas em Levítico e qual o seu significado?"
    },
    {
      icon: <MessageSquare className="h-4 w-4 text-pink-400" />,
      label: "Lei e graça",
      prompt: "Levítico só fala de regras ou há graça também?"
    },
    {
      icon: <CircleQuestion className="h-4 w-4 text-orange-400" />,
      label: "Disciplina divina",
      prompt: "O que aprendemos sobre disciplina e juízo de Deus em Levítico?"
    },
    {
      icon: <Book className="h-4 w-4 text-purple-400" />,
      label: "Ofertas voluntárias",
      prompt: "Quais ofertas em Levítico não eram obrigatórias e o que elas simbolizam?"
    },
    {
      icon: <Bible className="h-4 w-4 text-blue-400" />,
      label: "Roupas e separação",
      prompt: "Por que até as roupas eram reguladas em Levítico?"
    },
    {
      icon: <Cross className="h-4 w-4 text-green-400" />,
      label: "Chamado à santidade",
      prompt: "Como Levítico nos chama à santidade em todas as áreas da vida?"
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

export default LeviticusActionButtons;
