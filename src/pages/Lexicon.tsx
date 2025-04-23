import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '@/types/chat';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import MessageList from '@/components/MessageList';
import { queryLexicon, AssistantResponse } from '@/services/lexiconService';
import { sendToAssistant } from "@/services/lexiconService";

export default function Lexicon() {
  const [word, setWord] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | undefined>(undefined);

  cconst handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!word.trim() || isLoading) return;

  setIsLoading(true);
  try {
    // Chama o serviço já passando a palavra e o threadId atual (ou undefined na primeira vez)
    const { threadId: newThreadId, response } = await queryLexicon(word, threadId);

    // Atualiza o threadId para as próximas chamadas
    setThreadId(newThreadId);

    // Aqui você faz o que precisa com a resposta, ex:
    setMessages(prev => {
      // remove mensagem de “processando” e adiciona a resposta real
      const withoutProcessing = prev.filter(m => m.content !== 'Processando sua consulta...');
      return [...withoutProcessing, { role: 'assistant', content: response }];
    });

    // limpa o input
    setWord('');
  } catch (err) {
    console.error('Erro ao processar consulta:', err);
    toast({
      title: "Erro",
      description: "Não foi possível processar sua consulta. Por favor, tente novamente.",
      variant: "destructive",
    });
    // opcional: remover a mensagem de processando
    setMessages(prev => prev.filter(m => m.content !== 'Processando sua consulta...'));
  } finally {
    setIsLoading(false);
  }
};

      // Remover mensagem de processamento em caso de erro
      setMessages(prev => prev.filter(m => m.content !== 'Processando sua consulta...'));

      toast({
        title: 'Erro',
        description: 'Não foi possível processar sua consulta. Por favor, tente novamente.',
        variant: 'destructive'
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
