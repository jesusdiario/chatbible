
import { BookOpenText, MessageSquare, Grid, Baby, User } from "lucide-react";

const ActionButtons = () => {
  const actions = [
    { icon: <BookOpenText className="h-4 w-4 text-purple-400" />, label: "Exegese de Capítulo" },
    { icon: <MessageSquare className="h-4 w-4 text-blue-400" />, label: "Criar Pregação Expositiva" },
    { icon: <Grid className="h-4 w-4 text-green-400" />, label: "Estudo para Célula" },
    { icon: <Baby className="h-4 w-4 text-yellow-400" />, label: "Explicar para Crianças" },
    { icon: <User className="h-4 w-4 text-red-400" />, label: "Atividade Infantil" },
  ];

  return (
    <div className="flex gap-2 flex-wrap justify-center mt-4">
      {actions.map((action) => (
        <button 
          key={action.label} 
          className="relative flex h-[42px] items-center gap-1.5 rounded-full border border-[#383737] px-3 py-2 text-start text-[13px] shadow-xxs transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default ActionButtons;
