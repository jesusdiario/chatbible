import { Menu, CreditCard, User, Key, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
interface ChatHeaderProps {
  isSidebarOpen: boolean;
  onNewChat?: () => void;
  onToggleSidebar?: () => void;
}
const ChatHeader = ({
  isSidebarOpen,
  onNewChat,
  onToggleSidebar
}: ChatHeaderProps) => {
  const {
    toast
  } = useToast();
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };
  const handleChangePassword = () => {
    toast({
      title: "Alterar senha",
      description: "Um email foi enviado com instruções para alterar sua senha."
    });
  };
  const handleCancelSubscription = () => {
    toast({
      title: "Cancelar assinatura",
      description: "Em um ambiente de produção, você seria redirecionado para cancelar sua assinatura."
    });
  };
  const handleDeleteAccount = () => {
    toast({
      title: "Excluir conta",
      description: "Em um ambiente de produção, sua conta seria excluída permanentemente.",
      variant: "destructive"
    });
  };
  return <header className="fixed top-0 z-30 w-full border-b border-gray-200 bg-chatgpt-main">
      <div className="flex h-[60px] items-center justify-between px-4f">
        <div className="flex items-center gap-2">
          {!isSidebarOpen && onToggleSidebar && <Menu className="h-5 w-5 cursor-pointer" onClick={onToggleSidebar} />}
          <div className="text-xl font-semibold px-2 md:px[50px]">BibleGPT</div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 bg-chatgpt-main hover:bg-chatgpt-secondary">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-chatgpt-secondary">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleChangePassword}>
                <Key className="mr-2 h-4 w-4" />
                <span>Alterar senha</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCancelSubscription}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Cancelar assinatura</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDeleteAccount} className="text-red-500">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Excluir conta</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>;
};
export default ChatHeader;