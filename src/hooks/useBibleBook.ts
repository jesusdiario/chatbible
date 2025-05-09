import { useState, useEffect } from 'react';
import { getBibleBookBySlug } from '@/services/bibleService';
import { BibleBook } from '@/types/bible';

export const useBibleBook = (bookSlug?: string) => {
  const [bookDetails, setBookDetails] = useState<BibleBook | null>(null);
  const [loadingBook, setLoadingBook] = useState<boolean>(false);

  useEffect(() => {
    if (!bookSlug || bookSlug.trim() === '') {
      setBookDetails(null);
      setLoadingBook(false);
      return;
    }

    let isMounted = true; // garante que o estado só será atualizado se o componente ainda estiver montado

    const fetchBookDetails = async () => {
      setLoadingBook(true);

      try {
        const bookData = await getBibleBookBySlug(bookSlug);

        if (isMounted) {
          if (bookData && bookData !== bookDetails) {
            setBookDetails(bookData);
          } else if (!bookData) {
            console.warn('Livro não encontrado:', bookSlug);
            setBookDetails(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Erro ao buscar livro:', err);
          setBookDetails(null);
        }
      } finally {
        if (isMounted) {
          setLoadingBook(false);
        }
      }
    };

    fetchBookDetails();

    return () => {
      isMounted = false;
    };
  }, [bookSlug]);

  return { bookDetails, loadingBook };
};