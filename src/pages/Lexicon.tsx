
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { queryLexicon } from '@/services/lexiconService';
import { Message } from '@/types/chat';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function Lexicon() {
  const [word, setWord] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage: Message = { role: 'user', content: word };
    
    try {
      const systemMessage = { 
        role: 'system', 
        content: 'Você é um assistente especializado em léxico bíblico. Forneça definições precisas e contexto histórico.'
      };
      
      const allMessages = [...messages, userMessage];
      const { reply } = await queryLexicon(word, [systemMessage, ...allMessages]);
      
      const assistantMessage: Message = { role: 'assistant', content: reply };
      
      setMessages(prev => [...prev, userMessage, assistantMessage]);
      setWord('');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível processar sua consulta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b p-4">
        <h1 className="text-2xl font-bold">Léxico Bíblico</h1>
      </header>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                message.role === 'assistant'
                  ? 'bg-secondary ml-4'
                  : 'bg-primary mr-4'
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="border-t p-4 gap-2 flex">
        <Input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="Digite uma palavra para pesquisar..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Pesquisar'
          )}
        </Button>
      </form>
    </div>
  );
}
