
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";
import BookForm from '@/components/admin/BookForm';
import BooksTable from '@/components/admin/BooksTable';

const AdminBooks = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    book_category: 'pentateuco',
    image_url: ''
  });

  const queryClient = useQueryClient();

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
      image_url: book.image_url || ''
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este livro?')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      book_category: 'pentateuco',
      image_url: ''
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
                  <BookForm 
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmit}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <BooksTable 
              books={books || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminBooks;
