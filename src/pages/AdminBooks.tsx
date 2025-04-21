
import React from 'react';
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
import { useBooks } from '@/hooks/useBooks';
import { BookFormData } from '@/types/book';

const AdminBooks = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<BookFormData>({
    title: '',
    slug: '',
    book_category: 'pentateuco',
    image_url: ''
  });

  const {
    books,
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingBook,
    setEditingBook,
    createMutation,
    updateMutation,
    deleteMutation
  } = useBooks();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBook) {
      updateMutation.mutate({ ...formData, id: editingBook.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (book: BookFormData & { id: string }) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      slug: book.slug,
      book_category: book.book_category,
      image_url: book.image_url
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
    setEditingBook(null);
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
              <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                setIsAddDialogOpen(open);
                if (!open) resetForm();
              }}>
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
