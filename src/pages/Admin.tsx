
import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";

const Admin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);

  // Verifica se o usuário é admin
  React.useEffect(() => {
    const checkAdminRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase.rpc('has_role', {
        _user_id: session.user.id,
        _role: 'admin'
      });

      if (error) {
        console.error('Erro ao verificar papel de admin:', error);
        toast({
          title: "Erro de Autorização",
          description: "Não foi possível verificar suas permissões.",
          variant: "destructive"
        });
        setIsAdmin(false);
        return;
      }

      setIsAdmin(data);

      // Se não for admin, mostra uma mensagem toast
      if (!data) {
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão de administrador.",
          variant: "destructive"
        });
      }
    };

    checkAdminRole();
  }, []);

  // Busca estatísticas de uso
  const { data: stats } = useQuery({
    queryKey: ['usage-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usage_stats')
        .select('*')
        .order('date', { ascending: false })
        .limit(7);

      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true
  });

  // Carrega perguntas populares
  const { data: popularQuestions } = useQuery({
    queryKey: ['popular-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('popular_questions')
        .select('*')
        .order('usage_count', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true
  });

  if (isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center">Verificando permissões...</div>;
  }

  if (isAdmin === false) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        currentPath="/admin"
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="pt-[60px] pb-4 px-4 md:px-8 bg-chatgpt-main text-white min-h-screen">
          <div className="max-w-7xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold mb-6">Painel Administrativo</h1>
            
            <section>
              <h2 className="text-xl font-semibold mb-4">Menu Rápido</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/admin/categorias">
                  <Button variant="outline" className="w-full">
                    Gerenciar Categorias
                  </Button>
                </Link>
                <Link to="/admin/livros">
                  <Button variant="outline" className="w-full">
                    Gerenciar Livros
                  </Button>
                </Link>
                <Link to="/admin/paginas">
                  <Button variant="outline" className="w-full">
                    Gerenciar Páginas
                  </Button>
                </Link>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Estatísticas de Uso</h2>
              <div className="bg-chatgpt-sidebar rounded-lg p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Total de Mensagens</TableHead>
                      <TableHead>Usuários Únicos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats?.map((stat) => (
                      <TableRow key={stat.id}>
                        <TableCell>{new Date(stat.date).toLocaleDateString()}</TableCell>
                        <TableCell>{stat.total_messages}</TableCell>
                        <TableCell>{stat.unique_users}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Perguntas Mais Populares</h2>
              <div className="bg-chatgpt-sidebar rounded-lg p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pergunta</TableHead>
                      <TableHead>Contagem</TableHead>
                      <TableHead>Tipo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {popularQuestions?.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell>{question.question}</TableCell>
                        <TableCell>{question.usage_count}</TableCell>
                        <TableCell>
                          {question.is_predefined ? 'Predefinida' : 'Usuário'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
