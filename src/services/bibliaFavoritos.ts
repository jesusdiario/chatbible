
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Verse } from '@/types/biblia';
import { toNumber } from '@/utils/bibliaUtils';

// Função para criar uma chave única para um versículo favorito
export function createFavoriteKey(verse: Verse): string {
  if (!verse.book_id || verse.chapter === null || verse.verse === null) {
    throw new Error('Versículo inválido para favorito');
  }
  
  return `${verse.book_id}:${verse.chapter}:${verse.verse}`;
}

// Função para analisar uma chave de favorito
export function parseFavoriteKey(key: string): { bookId: number; chapter: number; verse: number } {
  const [bookIdStr, chapterStr, verseStr] = key.split(':');
  
  const bookId = toNumber(bookIdStr);
  const chapter = toNumber(chapterStr);
  const verse = toNumber(verseStr);
  
  if (bookId === undefined || chapter === undefined || verse === undefined) {
    throw new Error(`Chave de favorito inválida: ${key}`);
  }
  
  return { bookId, chapter, verse };
}

// Função para buscar um versículo favorito pelo seu ID
export async function getFavoriteVerse(favoriteKey: string): Promise<Verse | null> {
  try {
    const { bookId, chapter, verse } = parseFavoriteKey(favoriteKey);
    
    const { data, error } = await supabase
      .from('verses')
      .select('*')
      .eq('book_id', bookId)
      .eq('chapter', chapter)
      .eq('verse', verse)
      .single();
      
    if (error) {
      console.error('Erro ao buscar versículo favorito:', error);
      return null;
    }
    
    return data as Verse;
  } catch (error) {
    console.error('Erro ao processar favorito:', error);
    return null;
  }
}

// Função para buscar múltiplos versículos favoritos
export async function getFavoriteVerses(favoriteKeys: string[]): Promise<Verse[]> {
  // Se não houver favoritos, retornar array vazio
  if (!favoriteKeys.length) return [];
  
  // Criar consultas para cada favorito
  const versesPromises = favoriteKeys.map(getFavoriteVerse);
  
  // Executar todas as consultas
  const results = await Promise.all(versesPromises);
  
  // Filtrar resultados nulos
  return results.filter(Boolean) as Verse[];
}
