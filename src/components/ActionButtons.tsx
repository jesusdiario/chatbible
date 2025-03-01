import React, { createContext, useContext } from 'react';
import { Button } from "@/components/ui/button";
import AssistantList from './AssistantList';

interface ChatContextProps {
  sendMessage: (message: string) => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

const ActionButtons = () => {
  const { sendMessage } = useContext(ChatContext);

  // Exemplo de perguntas rápidas
  const quickQuestions = [
    "Explique o significado de João 3:16",
    "Quais são os nomes dos 12 apóstolos?",
    "O que a Bíblia diz sobre o amor ao próximo?",
    "Explique a parábola do filho pródigo"
  ];

  const handleQuickQuestion = (question: string) => {
    if (sendMessage) {
      sendMessage(question);
    }
  };

  return (
    <div className="space-y-8 w-full">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Perguntas sugeridas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {quickQuestions.map((question, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start text-left h-auto py-3 px-4"
              onClick={() => handleQuickQuestion(question)}
            >
              {question}
            </Button>
          ))}
        </div>
      </div>
      
      <AssistantList />
    </div>
  );
};

export { ActionButtons, ChatContext };
