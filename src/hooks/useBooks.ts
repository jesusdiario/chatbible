
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Book {
  id: string;
  title: string;
  slug: string;
  book_category: string;
  image_url?: string;
}

export const useBooks = () => {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const { data: books, isLoading } = useQuery({
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
    mutationFn: async (newBook: Omit<Book, 'id'>) => {
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
      setEditingBook(null);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro", 
        description: `Erro ao criar livro: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedBook: Book) => {
      const { data, error } = await supabase
        .from('bible_books')
        .update(updatedBook)
        .eq('id', updatedBook.id)
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
    },
    onError: (error: Error) => {
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
    onError: (error: Error) => {
      toast({ 
        title: "Erro", 
        description: `Erro ao excluir livro: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  return {
    books,
    isLoading,
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingBook,
    setEditingBook,
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
