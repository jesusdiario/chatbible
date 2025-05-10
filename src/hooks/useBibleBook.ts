
import { useState, useEffect, useRef } from 'react';
import { getBibleBookBySlug } from '@/services/bibleService';
import { BibleBook } from '@/types/bible';

export const useBibleBook = (bookSlug: string | undefined) => {
  const [bookDetails, setBookDetails] = useState<BibleBook | null>(null);
  const [loadingBook, setLoadingBook] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Se já buscou o livro com esse slug, não buscar novamente
    if (fetchedRef.current && bookDetails?.slug === bookSlug) {
      return;
    }
    
    const fetchBookDetails = async () => {
      if (!bookSlug) {
        setLoadingBook(false);
        return;
      }
      
      try {
        setLoadingBook(true);
        const bookData = await getBibleBookBySlug(bookSlug);
        if (bookData) {
          setBookDetails(bookData);
          fetchedRef.current = true;
        } else {
          console.error("Book not found:", bookSlug);
        }
      } catch (error) {
        console.error("Error fetching book details:", error);
      } finally {
        setLoadingBook(false);
      }
    };

    fetchBookDetails();
  }, [bookSlug, bookDetails]);

  return { bookDetails, loadingBook };
};
