
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const AssistantPage = () => {
  const { assistantId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite uma mensagem",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Aqui faríamos a integração com a API do ChatGPT para acessar o assistant
      // Como não temos a implementação completa agora, mostraremos um toast
      toast({
        title: "Mensagem enviada",
        description: `Mensagem enviada para o assistente ${assistantId}`,
      });
      
      // Redirecionamos de volta para a página principal após alguns segundos
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem para o assistant",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            className="p-2" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Assistente Especializado</h1>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium mb-4">Exegese de Capítulo</h2>
          <p className="text-gray-400 mb-6">
            Este assistente foi treinado especificamente para fazer exegese bíblica detalhada, incluindo contexto histórico, análise do texto original, 
            principais ensinamentos e aplicações para hoje.
          </p>
          <p className="text-sm">ID do Assistente: {assistantId}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="text-sm font-medium">
              Qual capítulo bíblico você deseja analisar?
            </label>
            <div className="flex gap-2">
              <Input
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Gênesis 1, Salmos 23, Mateus 5..."
                className="flex-1 bg-slate-800 border-slate-700"
              />
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? "Enviando..." : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssistantPage;
