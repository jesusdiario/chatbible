
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import { BookForm } from '@/components/BookForm';
import { BooksTable } from '@/components/BooksTable';
import { useBookForm } from '@/hooks/useBookForm';

const AdminBooks = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const {
    formData,
    setFormData,
    editingBook,
    setEditingBook,
    createMutation,
    updateMutation,
    deleteMutation,
    resetForm
  } = useBookForm();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBook) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
    setIsAddDialogOpen(false);
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

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        chatHistory={[]}
        currentPath={window.location.pathname}
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
                    editingBook={editingBook}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <BooksTable 
              books={books}
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
