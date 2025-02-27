
import { useState, useEffect } from 'react';
import { Settings, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChatHistory } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onApiKeyChange: (apiKey: string) => void;
  onChatSelect: (chatId: string) => void;
  chatHistory: ChatHistory[];
}

const Sidebar = ({
  isOpen,
  onToggle,
  onApiKeyChange,
  onChatSelect,
  chatHistory
}: SidebarProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleApiKeySave = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Erro",
        description: "A chave de API não pode estar vazia",
        variant: "destructive"
      });
      return;
    }
    onApiKeyChange(apiKey);
    setIsSettingsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso"
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 text-white transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">BibleGPT</h2>
              <button
                onClick={onToggle}
                className="md:hidden text-white hover:text-slate-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chatHistory.length > 0 ? (
              <div className="p-4">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Histórico de Conversas</h3>
                <ul className="space-y-1">
                  {[...chatHistory]
                    .sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime())
                    .map((chat) => (
                      <li key={chat.id}>
                        <button
                          onClick={() => onChatSelect(chat.id)}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-700 transition-colors text-sm"
                        >
                          <div className="truncate">{chat.title}</div>
                          <div className="text-xs text-slate-400">{formatDate(chat.lastAccessed)}</div>
                        </button>
                      </li>
                    ))
                  }
                </ul>
              </div>
            ) : (
              <div className="p-4 text-slate-400 text-sm">
                Nenhuma conversa salva ainda.
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-700">
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-700 transition-colors text-sm"
              >
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white text-black p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Configurações</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-1">
                  Chave de API da OpenAI
                </label>
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Insira sua chave de API"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Obtenha sua chave em: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600">platform.openai.com/api-keys</a>
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleApiKeySave}>
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
