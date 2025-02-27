
import { useState } from 'react';
import { LogOut, X, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChatHistory } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onChatSelect: (chatId: string) => void;
  chatHistory: ChatHistory[];
}

const Sidebar = ({
  isOpen,
  onToggle,
  onChatSelect,
  chatHistory
}: SidebarProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

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
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 text-white transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">BibleGPT</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onToggle} 
                className="text-white hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </Button>
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
        </div>
      </div>

      {/* Botão de menu flutuante quando a barra lateral estiver fechada */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-4 left-4 z-50 p-3 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}
    </>
  );
};

export default Sidebar;
