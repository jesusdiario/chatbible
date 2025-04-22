import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";

const AdminBooks = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    book_category: 'pentateuco',
    image_url: '',
    display_order: 0
  });

  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ['bible-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bible_categories')
        .select('*')
        .order('title');
      if (error) throw error;
      return data;
    }
  });

  const { data: books } = useQuery({
    queryKey: ['bible-books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bible_books')
        .select('*')
        .order('title');
      if (error) throw error;
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newBook: any) => {
      const { data, error } = await supabase
        .from('bible_books')
        .insert([newBook])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-books'] });
      toast({ title: "Sucesso", description: "Livro criado com sucesso!" });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro", 
        description: `Erro ao criar livro: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedBook: any) => {
      const { data, error } = await supabase
        .from('bible_books')
        .update(updatedBook)
        .eq('id', editingBook.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-books'] });
      toast({ title: "Sucesso", description: "Livro atualizado com sucesso!" });
      setIsAddDialogOpen(false);
      setEditingBook(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro", 
        description: `Erro ao atualizar livro: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bible_books')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bible-books'] });
      toast({ title: "Sucesso", description: "Livro excluído com sucesso!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro", 
        description: `Erro ao excluir livro: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBook) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (book: any) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      slug: book.slug,
      book_category: book.book_category,
      image_url: book.image_url || '',
      display_order: book.display_order || 0
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este livro?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFileUpload = async (file: File, bookSlug: string) => {
    try {
      const fileName = `${bookSlug}-${Date.now()}.${file.name.split('.').pop()}`;
      const { data, error } = await supabase
        .storage
        .from('covers')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase
        .storage
        .from('covers')
        .getPublicUrl(data.path);

      await supabase
        .from('bible_books')
        .update({ image_url: publicUrl })
        .eq('slug', bookSlug);

      queryClient.invalidateQueries({ queryKey: ['bible_books'] });
      toast({ title: "Sucesso", description: "Capa atualizada com sucesso!" });
    } catch (error: any) {
      toast({ 
        title: "Erro", 
        description: `Erro ao fazer upload da capa: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      book_category: 'pentateuco',
      image_url: '',
      display_order: 0
    });
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
              <h1 className="text-2xl font-bold">Gerenciar Livros da Bíblia</h1>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Adicionar Livro</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingBook ? 'Editar' : 'Adicionar'} Livro</DialogTitle>
                    <DialogDescription>
                      Preencha os dados do livro abaixo
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="title">Título</label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="slug">Slug</label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="category">Categoria</label>
                      <Select
                        value={formData.book_category}
                        onValueChange={(value) => setFormData({ ...formData, book_category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pentateuco">Pentateuco</SelectItem>
                          <SelectItem value="historico">Histórico</SelectItem>
                          <SelectItem value="poetico">Poético</SelectItem>
                          <SelectItem value="profetico">Profético</SelectItem>
                          <SelectItem value="novo_testamento">Novo Testamento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="image">Capa do Livro</label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && formData.slug) {
                            handleFileUpload(file, formData.slug);
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="display_order">Ordem de Exibição</label>
                      <Input
                        id="display_order"
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit">
                        {editingBook ? 'Salvar' : 'Adicionar'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books?.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{book.slug}</TableCell>
                    <TableCell>{book.book_category}</TableCell>
                    <TableCell>{book.display_order}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(book)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDelete(book.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminBooks;
