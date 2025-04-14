
import React from 'react';
import MessageInput from '@/components/MessageInput';
import { Button } from '@/components/ui/button';

interface EmptyStatePromptProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  title?: string;
  description?: string;
}

const EmptyStatePrompt = ({ 
  onSendMessage, 
  isLoading,
  title = "BibleGPT Assistant",
  description = "Ask any questions about the Bible or theology"
}: EmptyStatePromptProps) => {
  const sampleQuestions = [
    "O que a Bíblia diz sobre amor?",
    "Explique João 3:16",
    "Quem foi Paulo?",
    "Como preparar um sermão?"
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 w-full">
      <div className="mb-5 text-center">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-400">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
        {sampleQuestions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            className="justify-start h-auto py-3 text-left"
            onClick={() => onSendMessage(question)}
            disabled={isLoading}
          >
            {question}
          </Button>
        ))}
      </div>

      <MessageInput 
        onSubmit={onSendMessage} 
        isDisabled={isLoading} 
        isLoading={isLoading} 
      />
    </div>
  );
};

export default EmptyStatePrompt;
