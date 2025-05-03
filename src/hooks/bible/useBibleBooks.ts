
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BibleBook } from '@/types/biblia';
import { getBibleBooks } from '@/services/biblia';

export function useBibleBooks() {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar lista de livros
  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        const booksData = await getBibleBooks();
        setBooks(booksData);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar livros da Bíblia');
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os livros da Bíblia',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, [toast]);

  return {
    books,
    loading,
    error
  };
}
