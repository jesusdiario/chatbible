
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Category {
  id: string;
  title: string;
  slug: string;
  display_order: number;
  page_slug: string;
}

interface CategoryFormData {
  title: string;
  display_order: number;
  page_slug: string;
}

const AdminCategories = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    title: '',
    display_order: 0,
    page_slug: 'livros-da-biblia'
  });

  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['bible-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bible_categories')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data as Category[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newCategory: CategoryFormData) => {
      const { data, error } = await supabase
        .from('bible_categories')
        .insert([{
          ...newCategory,
          slug: newCategory.title.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '-')
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-categories'] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Erro ao criar categoria: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (category: Category) => {
      const { data, error } = await supabase
        .from('bible_categories')
        .update({
          title: category.title,
          display_order: category.display_order,
          page_slug: category.page_slug
        })
        .eq('id', category.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-categories'] });
      setIsEditDialogOpen(false);
      setCurrentCategory(null);
      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar categoria: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bible_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-categories'] });
      setIsDeleteDialogOpen(false);
      setCurrentCategory(null);
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Erro ao excluir categoria: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleAddCategory = () => {
    if (!formData.title) {
      toast({
        title: "Campos obrigatórios",
        description: "O título é obrigatório.",
        variant: "destructive"
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdateCategory = () => {
    if (!currentCategory || !currentCategory.title) {
      toast({
        title: "Campos obrigatórios",
        description: "O título é obrigatório.",
        variant: "destructive"
      });
      return;
    }
    updateMutation.mutate(currentCategory);
  };

  const handleDeleteCategory = () => {
    if (currentCategory) {
      deleteMutation.mutate(currentCategory.id);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      display_order: 0,
      page_slug: 'livros-da-biblia'
    });
  };

  const openEditDialog = (category: Category) => {
    setCurrentCategory(category);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteDialogOpen(true);
  };

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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Gerenciar Categorias</h1>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </div>

            <Card className="bg-chatgpt-sidebar border-none text-white">
              <CardHeader>
                <CardTitle>Categorias</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">Carregando categorias...</div>
                ) : !categories || categories.length === 0 ? (
                  <div className="text-center py-4">
                    Nenhuma categoria encontrada. Clique em "Nova Categoria" para criar uma.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Ordem</TableHead>
                        <TableHead>Página</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>{category.title}</TableCell>
                          <TableCell>{category.display_order}</TableCell>
                          <TableCell>{category.page_slug || '-'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => openEditDialog(category)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openDeleteDialog(category)}
                              >
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

      {/* Diálogo para adicionar categoria */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-chatgpt-sidebar text-white">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Categoria</DialogTitle>
            <DialogDescription className="text-gray-400">
              Crie uma nova categoria para organizar os conteúdos.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="title" className="text-right">
                Título
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="col-span-3 bg-chatgpt-main border-gray-700"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="order" className="text-right">
                Ordem
              </label>
              <Input
                id="order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                className="col-span-3 bg-chatgpt-main border-gray-700"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="page" className="text-right">
                Página
              </label>
              <Input
                id="page"
                value={formData.page_slug}
                onChange={(e) => setFormData({ ...formData, page_slug: e.target.value })}
                className="col-span-3 bg-chatgpt-main border-gray-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddCategory}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar categoria */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-chatgpt-sidebar text-white">
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
            <DialogDescription className="text-gray-400">
              Atualize os detalhes da categoria.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-title" className="text-right">
                Título
              </label>
              <Input
                id="edit-title"
                value={currentCategory?.title || ''}
                onChange={(e) => setCurrentCategory(prev => prev ? { ...prev, title: e.target.value } : null)}
                className="col-span-3 bg-chatgpt-main border-gray-700"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-order" className="text-right">
                Ordem
              </label>
              <Input
                id="edit-order"
                type="number"
                value={currentCategory?.display_order || 0}
                onChange={(e) => setCurrentCategory(prev => prev ? { ...prev, display_order: parseInt(e.target.value) } : null)}
                className="col-span-3 bg-chatgpt-main border-gray-700"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-page" className="text-right">
                Página
              </label>
              <Input
                id="edit-page"
                value={currentCategory?.page_slug || ''}
                onChange={(e) => setCurrentCategory(prev => prev ? { ...prev, page_slug: e.target.value } : null)}
                className="col-span-3 bg-chatgpt-main border-gray-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateCategory}>
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
              Você tem certeza que deseja excluir a categoria "{currentCategory?.title}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleDeleteCategory} variant="destructive">
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
