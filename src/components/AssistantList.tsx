
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Bot, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAssistants } from '@/hooks/useAssistants';

const AssistantList = () => {
  const navigate = useNavigate();
  const { assistants, loading, fetchAssistants } = useAssistants();

  useEffect(() => {
    fetchAssistants();
  }, []);

  const handleSelectAssistant = (assistantId: string) => {
    navigate(`/assistant/${assistantId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (assistants.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Assistentes Especializados</CardTitle>
          <CardDescription>
            Nenhum assistente disponível. Crie assistentes no Dashboard da OpenAI.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => window.open('https://platform.openai.com/assistants', '_blank')}
          >
            Acessar OpenAI Assistants
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Assistentes Especializados</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assistants.map((assistant) => (
          <Card key={assistant.id} className="bg-slate-800 border-slate-700 hover:bg-slate-700/70 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
              </div>
              <CardTitle className="mt-2">{assistant.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {assistant.description || 'Assistente da OpenAI'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Modelo: {assistant.model}
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => handleSelectAssistant(assistant.id)}
              >
                Conversar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AssistantList;
