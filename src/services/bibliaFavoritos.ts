
import { supabase } from '@/integrations/supabase/client';
import { Verse } from '@/types/biblia';

export async function saveFavoriteVerse(verse: Verse) {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) return null;
  
  const { data, error } = await supabase
    .from('bible_favorites')
    .insert({
      user_id: user.user.id,
      book_id: verse.book_id,
      chapter: verse.chapter,
      verse: verse.verse,
      text: verse.text,
      book_name: verse.book_name,
      book_slug: verse.book_slug
    })
    .select();
  
  if (error) {
    console.error('Erro ao salvar versículo favorito:', error);
    throw new Error('Não foi possível salvar o versículo como favorito');
  }
  
  return data?.[0] || null;
}

export async function getFavoriteVerses() {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) return [];
  
  const { data, error } = await supabase
    .from('bible_favorites')
    .select('*')
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Erro ao buscar versículos favoritos:', error);
    throw new Error('Não foi possível carregar seus versículos favoritos');
  }
  
  return data || [];
}

export async function removeFavoriteVerse(verseId: number) {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) return false;
  
  const { error } = await supabase
    .from('bible_favorites')
    .delete()
    .eq('id', verseId)
    .eq('user_id', user.user.id);
  
  if (error) {
    console.error('Erro ao remover versículo favorito:', error);
    throw new Error('Não foi possível remover o versículo dos favoritos');
  }
  
  return true;
}

export async function isFavoriteVerse(bookId: number, chapter: number, verse: number) {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) return false;
  
  const { data, error } = await supabase
    .from('bible_favorites')
    .select('id')
    .eq('user_id', user.user.id)
    .eq('book_id', bookId)
    .eq('chapter', chapter)
    .eq('verse', verse)
    .maybeSingle();
  
  if (error) {
    console.error('Erro ao verificar versículo favorito:', error);
    return false;
  }
  
  return !!data;
}
