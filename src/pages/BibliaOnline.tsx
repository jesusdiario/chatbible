
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BibleReaderPage from '../biblia-online/pages/BibleReaderPage';
import LivrosDaBibliaBook from './LivrosDaBibliaBook';
import { useSidebarControl } from '@/hooks/useSidebarControl';
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/biblia-online/components/ui/sidebar';
import { Book, Home, Settings, Search, MessageSquare } from 'lucide-react';

const BibliaOnline: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebarControl();

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar>
          <SidebarHeader className="pb-0">
            <div className="flex h-14 items-center px-4 py-2">
              <span className="text-lg font-bold">Bíblia Online</span>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/">
                    <Home />
                    <span>Início</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/livros-da-biblia">
                    <Book />
                    <span>Livros da Bíblia</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/chat">
                    <MessageSquare />
                    <span>Chat Bíblico</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/search">
                    <Search />
                    <span>Buscar</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/settings">
                    <Settings />
                    <span>Configurações</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<BibleReaderPage />} />
            <Route path="/livros-da-biblia/:book/:slug?" element={<LivrosDaBibliaBook />} />
          </Routes>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default BibliaOnline;
