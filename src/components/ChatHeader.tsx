
import React from "react";
import { Menu, User } from "lucide-react";
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
  onToggleSidebar
}: ChatHeaderProps) => {
  const { toast } = useToast();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleChangePassword = () => {
    toast({
      title: "Alterar senha",
      description: "Um email foi enviado com instruções para alterar sua senha."
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Excluir conta",
      description: "Em um ambiente de produção, sua conta seria excluída permanentemente.",
      variant: "destructive"
    });
  };

  return (
    <header className="fixed top-0 z-30 w-full border-b border-gray-200 bg-chatgpt-main">
      <div className="flex h-[60px] items-center justify-between px-4">
        {/* Left section - Menu toggle */}
        <div className="flex items-center">
          {onToggleSidebar && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggleSidebar}
              className="hover:bg-chatgpt-secondary"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Center section - Logo */}
        <div className={`absolute left-1/2 transform -translate-x-1/2 transition-all duration-300 ${isSidebarOpen ? 'md:left-[calc(50%+128px)]' : ''}`}>
          <h1 className="text-xl font-bold">BibleChat</h1>
        </div>

        {/* Right section - User menu */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-8 w-8 bg-chatgpt-main hover:bg-chatgpt-secondary"
              >
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-chatgpt-secondary">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleChangePassword}>
                <span>Alterar senha</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteAccount} className="text-red-500">
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
    </header>
  );
};

export default ChatHeader;
