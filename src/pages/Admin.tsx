import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Admin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        onApiKeyChange={() => {}}
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="pt-[60px] pb-4 px-4 md:px-8 bg-chatgpt-main text-white min-h-screen">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-8">Painel Administrativo</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Livros da Bíblia Card */}
              <Link to="/admin/livros" className="block">
                <Card className="bg-chatgpt-sidebar border-none hover:bg-chatgpt-hover transition-colors">
                  <CardHeader>
                    <CardTitle className="text-white">Livros da Bíblia</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">Gerenciar livros, conteúdo e categorização</p>
                  </CardContent>
                </Card>
              </Link>

              {/* Categorias Card */}
              <Link to="/admin/categorias" className="block">
                <Card className="bg-chatgpt-sidebar border-none hover:bg-chatgpt-hover transition-colors">
                  <CardHeader>
                    <CardTitle className="text-white">Categorias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">Gerenciar categorias e organização do conteúdo</p>
                  </CardContent>
                </Card>
              </Link>

              {/* Páginas Card */}
              <Link to="/admin/paginas" className="block">
                <Card className="bg-chatgpt-sidebar border-none hover:bg-chatgpt-hover transition-colors">
                  <CardHeader>
                    <CardTitle className="text-white">Páginas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">Gerenciar páginas personalizadas do site</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
