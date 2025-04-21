
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
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
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type CustomPage = {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  created_at: string;
  updated_at: string;
};

type Category = {
  id: string;
  title: string;
};

const AdminPages = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newPage, setNewPage] = useState<{ title: string; slug: string; category_id: string | null }>({
    title: '',
    slug: '',
    category_id: null,
  });
  const [currentPage, setCurrentPage] = useState<CustomPage | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Verifica se o usuário é admin
  useEffect(() => {
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

  // Busca todas as páginas
  const { data: pages, isLoading: isPagesLoading } = useQuery({
    queryKey: ['admin-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_pages')
        .select('*')
        .order('title');

      if (error) throw error;
      return data as CustomPage[];
    },
    enabled: isAdmin === true
  });

  // Busca todas as categorias para o select
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bible_categories')
        .select('id, title')
        .order('title');

      if (error) throw error;
      return data as Category[];
    },
    enabled: isAdmin === true
  });

  // Mutation para adicionar uma nova página
  const addPageMutation = useMutation({
    mutationFn: async ({ title, slug, category_id }: { title: string; slug: string; category_id: string | null }) => {
      // Verifica se o slug já existe
      const { data: existingPage } = await supabase
        .from('custom_pages')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existingPage) {
        throw new Error('Um outro conteúdo com este URL já existe. Por favor, escolha um URL diferente.');
      }

      const { data, error } = await supabase
        .from('custom_pages')
        .insert([{ title, slug, category_id }])
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      setIsAddDialogOpen(false);
      toast({
        title: "Página Adicionada",
        description: "A página foi criada com sucesso.",
      });
      resetNewPage();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao criar a página.",
        variant: "destructive"
      });
    }
  });

  // Mutation para atualizar uma página
  const updatePageMutation = useMutation({
    mutationFn: async ({ id, title, slug, category_id }: { id: string; title: string; slug: string; category_id: string | null }) => {
      // Verifica se o slug já existe para outro registro
      const { data: existingPage } = await supabase
        .from('custom_pages')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single();

      if (existingPage) {
        throw new Error('Um outro conteúdo com este URL já existe. Por favor, escolha um URL diferente.');
      }

      const { data, error } = await supabase
        .from('custom_pages')
        .update({ title, slug, category_id })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      setIsEditDialogOpen(false);
      toast({
        title: "Página Atualizada",
        description: "A página foi atualizada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao atualizar a página.",
        variant: "destructive"
      });
    }
  });

  // Mutation para excluir uma página
  const deletePageMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custom_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      setIsDeleteDialogOpen(false);
      setCurrentPage(null);
      toast({
        title: "Página Excluída",
        description: "A página foi excluída com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir a página.",
        variant: "destructive"
      });
    }
  });

  const handleAddPage = () => {
    if (!newPage.title || !newPage.slug) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e URL são campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    addPageMutation.mutate(newPage);
  };

  const handleUpdatePage = () => {
    if (!currentPage || !currentPage.title || !currentPage.slug) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e URL são campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    updatePageMutation.mutate(currentPage);
  };

  const handleDeletePage = () => {
    if (currentPage) {
      deletePageMutation.mutate(currentPage.id);
    }
  };

  const resetNewPage = () => {
    setNewPage({
      title: '',
      slug: '',
      category_id: null,
    });
  };

  const openEditDialog = (page: CustomPage) => {
    setCurrentPage(page);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (page: CustomPage) => {
    setCurrentPage(page);
    setIsDeleteDialogOpen(true);
  };

  // Helper para gerar slug a partir do título
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean) => {
    const title = e.target.value;
    if (isNew) {
      setNewPage(prev => ({ ...prev, title, slug: generateSlug(title) }));
    } else if (currentPage) {
      setCurrentPage(prev => prev ? { ...prev, title, slug: generateSlug(title) } : null);
    }
  };

  if (isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center bg-chatgpt-main">Verificando permissões...</div>;
  }

  if (isAdmin === false) {
    return <Navigate to="/" replace />;
  }

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
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Gerenciar Páginas</h1>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Página
              </Button>
            </div>

            <Card className="bg-chatgpt-sidebar border-none text-white">
              <CardHeader>
                <CardTitle>Páginas Personalizadas</CardTitle>
                <CardDescription className="text-gray-400">
                  Gerencie páginas personalizadas que podem ser usadas em seu site.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isPagesLoading ? (
                  <div className="text-center py-4">Carregando páginas...</div>
                ) : !pages || pages.length === 0 ? (
                  <div className="text-center py-4">Nenhuma página encontrada. Clique em "Nova Página" para criar uma.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pages.map((page) => (
                        <TableRow key={page.id}>
                          <TableCell>{page.title}</TableCell>
                          <TableCell>{page.slug}</TableCell>
                          <TableCell>
                            {page.category_id && categories 
                              ? categories.find(c => c.id === page.category_id)?.title || '-' 
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditDialog(page)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => openDeleteDialog(page)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Diálogo para adicionar uma nova página */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-chatgpt-sidebar text-white">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Página</DialogTitle>
            <DialogDescription className="text-gray-400">
              Crie uma nova página personalizada para seu site.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="title" className="text-right">
                Título
              </label>
              <Input
                id="title"
                value={newPage.title}
                onChange={(e) => handleTitleChange(e, true)}
                className="col-span-3 bg-chatgpt-main border-gray-700"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="slug" className="text-right">
                URL
              </label>
              <Input
                id="slug"
                value={newPage.slug}
                onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                className="col-span-3 bg-chatgpt-main border-gray-700"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="category" className="text-right">
                Categoria
              </label>
              <select
                id="category"
                value={newPage.category_id || ''}
                onChange={(e) => setNewPage({ ...newPage, category_id: e.target.value || null })}
                className="col-span-3 bg-chatgpt-main border-gray-700 p-2 rounded"
              >
                <option value="">Sem categoria</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddPage} disabled={!newPage.title || !newPage.slug}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar uma página */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-chatgpt-sidebar text-white">
          <DialogHeader>
            <DialogTitle>Editar Página</DialogTitle>
            <DialogDescription className="text-gray-400">
              Atualize os detalhes da página.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-title" className="text-right">
                Título
              </label>
              <Input
                id="edit-title"
                value={currentPage?.title || ''}
                onChange={(e) => handleTitleChange(e, false)}
                className="col-span-3 bg-chatgpt-main border-gray-700"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-slug" className="text-right">
                URL
              </label>
              <Input
                id="edit-slug"
                value={currentPage?.slug || ''}
                onChange={(e) => setCurrentPage(prev => prev ? { ...prev, slug: e.target.value } : null)}
                className="col-span-3 bg-chatgpt-main border-gray-700"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-category" className="text-right">
                Categoria
              </label>
              <select
                id="edit-category"
                value={currentPage?.category_id || ''}
                onChange={(e) => setCurrentPage(prev => prev ? { ...prev, category_id: e.target.value || null } : null)}
                className="col-span-3 bg-chatgpt-main border-gray-700 p-2 rounded"
              >
                <option value="">Sem categoria</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdatePage} disabled={!currentPage?.title || !currentPage?.slug}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para confirmar exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-chatgpt-sidebar text-white">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription className="text-gray-400">
              Você tem certeza que deseja excluir a página "{currentPage?.title}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleDeletePage} variant="destructive">
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPages;
