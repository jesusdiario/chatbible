
import React, { useContext } from "react";

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
      label: "Autoria de Gênesis",
      prompt: "Quem escreveu o livro de Gênesis?"
    },
    { 
      label: "Significado do Nome",
      prompt: "Qual é o significado do nome 'Gênesis'?"
    },
    { 
      label: "Temas Principais",
      prompt: "Quais são os principais temas abordados em Gênesis?"
    },
    { 
      label: "Relação com o Pentateuco",
      prompt: "Como Gênesis se relaciona com os outros livros do Pentateuco?"
    },
    { 
      label: "Personagens Principais",
      prompt: "Quais são os principais personagens do livro?"
    },
    { 
      label: "Estrutura Literária",
      prompt: "Qual é a estrutura literária de Gênesis?"
    },
    { 
      label: "Genealogias",
      prompt: "Quais são as principais genealogias apresentadas?"
    },
    { 
      label: "Relação Deus-Humanidade",
      prompt: "Como Gênesis aborda a relação entre Deus e a humanidade?"
    },
    { 
      label: "Alianças em Gênesis",
      prompt: "Quais são as principais alianças estabelecidas em Gênesis?"
    },
    { 
      label: "Interpretações Tradicionais",
      prompt: "Como o livro de Gênesis é interpretado nas tradições judaica e cristã?"
    },
    { 
      label: "Dias da Criação",
      prompt: "Quantos dias Deus levou para criar o mundo?"
    },
    { 
      label: "Relatos da Criação",
      prompt: "Qual é a diferença entre os relatos de criação em Gênesis 1 e 2?"
    },
    { 
      label: "Primeiros Humanos",
      prompt: "Quem foram os primeiros seres humanos criados por Deus?"
    },
    { 
      label: "Primeiro Mandamento",
      prompt: "Qual foi o primeiro mandamento dado por Deus ao homem?"
    },
    { 
      label: "Desobediência",
      prompt: "O que levou Adão e Eva a desobedecerem a Deus?"
    },
    { 
      label: "Consequências",
      prompt: "Qual foi a consequência da desobediência de Adão e Eva?"
    },
    { 
      label: "Primeiro Filho",
      prompt: "Quem foi o primeiro filho de Adão e Eva?"
    },
    { 
      label: "Morte de Abel",
      prompt: "Por que Caim matou Abel?"
    },
    { 
      label: "Punição de Caim",
      prompt: "Qual foi a punição de Deus para Caim?"
    },
    { 
      label: "Importância de Sete",
      prompt: "Quem foi Sete e qual foi sua importância?"
    },
    { 
      label: "Causa do Dilúvio",
      prompt: "Por que Deus decidiu enviar o dilúvio?"
    },
    { 
      label: "Construtor da Arca",
      prompt: "Quem foi escolhido por Deus para construir a arca?"
    },
    { 
      label: "Duração do Dilúvio",
      prompt: "Quantos dias durou o dilúvio?"
    },
    { 
      label: "Animais na Arca",
      prompt: "Quantos pares de animais foram levados para a arca?"
    },
    { 
      label: "Aliança com Noé",
      prompt: "Qual foi o sinal da aliança de Deus com Noé após o dilúvio?"
    },
    { 
      label: "Local da Arca",
      prompt: "Onde a arca repousou após o dilúvio?"
    },
    { 
      label: "Filhos de Noé",
      prompt: "Quem foram os filhos de Noé?"
    },
    { 
      label: "Maldição de Noé",
      prompt: "Qual foi a maldição proferida por Noé após o dilúvio?"
    },
    { 
      label: "Significado do Arco-íris",
      prompt: "O que representa o arco-íris na narrativa do dilúvio?"
    },
    { 
      label: "Impacto do Dilúvio",
      prompt: "Como o dilúvio afetou a humanidade segundo Gênesis?"
    },
    { 
      label: "Motivação de Babel",
      prompt: "O que motivou a construção da Torre de Babel?"
    },
    { 
      label: "Reação Divina",
      prompt: "Como Deus reagiu à construção da torre?"
    },
    { 
      label: "Consequência em Babel",
      prompt: "Qual foi a consequência da intervenção divina na Torre de Babel?"
    },
    { 
      label: "Significado de Babel",
      prompt: "O que significa 'Babel'?"
    },
    { 
      label: "Dispersão Linguística",
      prompt: "Como a dispersão das línguas afetou a humanidade?"
    },
    { 
      label: "Diversidade Cultural",
      prompt: "Qual é a relação entre a Torre de Babel e a diversidade cultural?"
    },
    { 
      label: "Pelegue",
      prompt: "Quem foi Pelegue e qual é sua importância?"
    },
    { 
      label: "Genealogia de Sem",
      prompt: "Como a genealogia de Sem é apresentada após a dispersão?"
    },
    { 
      label: "Propósito de Babel",
      prompt: "Qual é o propósito da narrativa da Torre de Babel em Gênesis?"
    },
    { 
      label: "Babel e Abraão",
      prompt: "Como a história da Torre de Babel se conecta com a chamada de Abraão?"
    },
    { 
      label: "Importância de Abraão",
      prompt: "Quem foi Abraão e por que é uma figura central em Gênesis?"
    },
    { 
      label: "Promessa Divina",
      prompt: "Qual foi a promessa de Deus a Abraão?"
    },
    { 
      label: "Papel de Isaque",
      prompt: "Quem foi Isaque e qual foi seu papel na continuidade da aliança?"
    },
    { 
      label: "Primogenitura de Jacó",
      prompt: "Como Jacó obteve a primogenitura de Esaú?"
    },
    { 
      label: "Sonho de Jacó",
      prompt: "Qual foi o significado do sonho de Jacó com a escada?"
    },
    { 
      label: "Filhos de Jacó",
      prompt: "Quem foram os doze filhos de Jacó?"
    },
    { 
      label: "Venda de José",
      prompt: "Por que José foi vendido por seus irmãos?"
    },
    { 
      label: "José no Egito",
      prompt: "Como José chegou ao Egito e qual foi seu destino lá?"
    },
    { 
      label: "Providência em José",
      prompt: "Como a história de José demonstra a providência divina?"
    },
    { 
      label: "Transição para Êxodo",
      prompt: "Como o livro de Gênesis prepara o cenário para o Êxodo?"
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4 pb-8">
      {actions.map((action) => (
        <button 
          key={action.label} 
          className="relative flex h-[42px] items-center gap-1.5 rounded-full border border-[#383737] px-3 py-2 text-start text-[13px] shadow-xxs transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"
          onClick={() => handleButtonClick(action.prompt)}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default ActionButtons;
