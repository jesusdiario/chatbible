import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-lg font-semibold">Administração</h1>
          </div>
        </div>
        <div className="flex-1 p-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/admin/books')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Gerenciador de Livros
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="m5 8 6 6 6-6"/>
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Livros</div>
                <p className="text-xs text-muted-foreground pt-1">
                  Gerencie os livros da bíblia
                </p>
              </CardContent>
            </Card>

            <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/admin/pages')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Gerenciador de Páginas
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="m5 8 6 6 6-6"/>
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Páginas</div>
                <p className="text-xs text-muted-foreground pt-1">
                  Gerencie as páginas do sistema
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate('/admin/translation')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Gerenciador de Traduções
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="m5 8 6 6 6-6"/>
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Traduções</div>
                <p className="text-xs text-muted-foreground pt-1">
                  Gerencie as traduções automáticas do sistema
                </p>
              </CardContent>
            </Card>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
