
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
}

const ChatHeader = ({ isSidebarOpen, onToggleSidebar, onNewChat }: ChatHeaderProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado do BibleGPT",
      });
      navigate("/auth");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao tentar desconectar",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-4 border-b border-slate-700 bg-slate-800">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onToggleSidebar}
          className="mr-2 text-slate-300 hover:text-white hover:bg-slate-700"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-white">BibleGPT</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onNewChat}
          className="text-slate-300 hover:text-white hover:bg-slate-700"
          title="Nova conversa"
        >
          <Plus className="h-5 w-5" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleLogout}
          className="text-slate-300 hover:text-white hover:bg-slate-700"
          title="Sair"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default ChatHeader;
