import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '@/types/chat';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import MessageList from '@/components/MessageList';
import { queryLexicon } from '@/services/lexiconService';

export default function Lexicon() {
  const [word, setWord] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || isLoading) return;

    setIsLoading(true);

    // Adiciona a mensagem do usuário ao histórico
    const userMessage: Message = { role: 'user', content: word };
    setMessages(prev => [...prev, userMessage]);

    // Exibe mensagem de processamento
    const processingMessage: Message = { role: 'assistant', content: 'Processando sua consulta...' };
    setMessages(prev => [...prev, processingMessage]);

    try {
      // Chama o serviço com a palavra e thread atual
      const { threadId: newThreadId, response } = await queryLexicon(word, threadId);
      // Atualiza o threadId para continuar o contexto
      setThreadId(newThreadId);

      // Substitui a mensagem de processamento pela resposta do Assistente
      setMessages(prev => {
        const withoutProcessing = prev.filter(m => m.content !== 'Processando sua consulta...');
        return [...withoutProcessing, { role: 'assistant', content: response }];
      });

      setWord('');
    } catch (error) {
      console.error('Erro ao processar consulta:', error);
      // Remove a mensagem de processamento
      setMessages(prev => prev.filter(m => m.content !== 'Processando sua consulta...'));

      toast({
        title: 'Erro',
        description: 'Não foi possível processar sua consulta. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b p-4">
        <h1 className="text-2xl font-bold">Léxico Bíblico</h1>
        <p className="text-sm text-muted-foreground">
          Consulte termos e palavras bíblicas em seus idiomas originais
        </p>
      </header>

      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto p-4">
          <MessageList messages={messages} isTyping={isLoading} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="border-t p-4 gap-2 flex">
        <Input
          type="text"
          value={word}
          onChange={e => setWord(e.target.value)}
          placeholder="Digite uma palavra ou termo para pesquisar..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Pesquisar'}
        </Button>
      </form>
    </div>
  );
}
