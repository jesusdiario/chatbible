
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { queryLexicon } from '@/services/lexiconService';
import { Message } from '@/types/chat';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import MessageList from '@/components/MessageList';

export default function Lexicon() {
  const [word, setWord] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage: Message = { role: 'user', content: word };
    
    // Adicionar mensagem do usuário imediatamente
    setMessages(prev => [...prev, userMessage]);
    
    // Adicionar mensagem de "processando"
    const processingMessage: Message = { 
      role: 'assistant', 
      content: 'Processando sua consulta...'
    };
    
    setMessages(prev => [...prev, processingMessage]);
    
    try {
      const systemMessage = { 
        role: 'system', 
        content: 'Você é um assistente especializado em léxico bíblico. Forneça definições precisas e contexto histórico.'
      };
      
      const { reply } = await queryLexicon(word, [systemMessage, userMessage]);
      
      // Substituir mensagem de processamento pela resposta real
      setMessages(prev => {
        const filteredMessages = prev.filter(m => m.content !== 'Processando sua consulta...');
        return [...filteredMessages, { role: 'assistant', content: reply }];
      });
      
      setWord('');
    } catch (error) {
      console.error('Erro ao processar consulta:', error);
      
      // Remover mensagem de processamento em caso de erro
      setMessages(prev => prev.filter(m => m.content !== 'Processando sua consulta...'));
      
      toast({
        title: "Erro",
        description: "Não foi possível processar sua consulta. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b p-4 fixed top-0 w-full bg-white z-10">
        <h1 className="text-2xl font-bold">Léxico Bíblico</h1>
        <p className="text-sm text-muted-foreground">Consulte termos e palavras bíblicas em seus idiomas originais</p>
      </header>

      <div className="pt-20 pb-16 px-4 flex flex-col h-full">
        <div className="max-w-3xl mx-auto w-full flex-1">
          <ScrollArea className="h-full">
            <MessageList 
              messages={messages} 
              isTyping={isLoading}
            />
          </ScrollArea>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border-t p-4 fixed bottom-0 w-full bg-white z-10 flex gap-2">
        <div className="max-w-3xl mx-auto w-full flex gap-2">
          <Input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Digite uma palavra ou termo para pesquisar..."
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
        </div>
      </form>
    </div>
  );
}
