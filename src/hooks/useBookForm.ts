
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

interface BookFormData {
  title: string;
  slug: string;
  book_category: string;
  image_url: string;
  display_order: number;
}

export function useBookForm() {
  const [editingBook, setEditingBook] = useState<any>(null);
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    slug: '',
    book_category: 'pentateuco',
    image_url: '',
    display_order: 0
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (newBook: BookFormData) => {
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
    mutationFn: async (updatedBook: BookFormData) => {
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

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      book_category: 'pentateuco',
      image_url: '',
      display_order: 0
    });
  };

  return {
    formData,
    setFormData,
    editingBook,
    setEditingBook,
    createMutation,
    updateMutation,
    deleteMutation,
    resetForm
  };
}
