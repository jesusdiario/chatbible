
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Verse, BibleBook } from '@/types/biblia';
import { getBookChapters, getChapterVerses } from '@/services/biblia';

export function useBibleChapter(currentBook: BibleBook | null, currentChapter: number) {
  const [chapterCount, setChapterCount] = useState(0);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Ao mudar o livro atual, carregar contagem de capítulos
  useEffect(() => {
    const loadChapterCount = async () => {
      if (!currentBook?.id) return;
      
      try {
        const count = await getBookChapters(currentBook.id);
        setChapterCount(count);
      } catch (err) {
        setError('Erro ao carregar capítulos');
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os capítulos',
          variant: 'destructive',
        });
      }
    };

    loadChapterCount();
  }, [currentBook, toast]);

  // Ao mudar o livro ou capítulo, carregar versículos
  useEffect(() => {
    const loadVerses = async () => {
      if (!currentBook?.id) return;
      
      try {
        setLoading(true);
        const result = await getChapterVerses(currentBook.id, currentChapter);
        if (result) {
          // Mapear para o tipo Verse correto
          const mappedVerses: Verse[] = result.verses.map(v => ({
            id: v.id,
            book_id: v.book_id || currentBook.id,
            chapter: v.chapter,
            verse: v.verse,
            text: v.text,
            version: currentBook.name,
            abbrev: v.abbrev,
            book_name: v.book_name,
            book_slug: v.book_slug,
            text_nvi: v.text_nvi,
            text_acf: v.text_acf,
            text_ara: v.text_ara,
            text_arc: v.text_arc,
            text_naa: v.text_naa,
            text_ntlh: v.text_ntlh,
            text_nvt: v.text_nvt
          }));
          
          setVerses(mappedVerses);
          setError(null);
        } else {
          setVerses([]);
          setError('Nenhum versículo encontrado');
        }
      } catch (err) {
        setVerses([]);
        setError('Erro ao carregar versículos');
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os versículos',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadVerses();
  }, [currentBook, currentChapter, toast]);

  return {
    chapterCount,
    verses,
    loading,
    error
  };
}
