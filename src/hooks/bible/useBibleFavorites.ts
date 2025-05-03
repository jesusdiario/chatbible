
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Verse } from '@/types/biblia';
import { isFavoriteVerse, saveFavoriteVerse, removeFavoriteVerse } from '@/services/bibliaFavoritos';

export function useBibleFavorites() {
  const { toast } = useToast();

  const addFavorite = async (verse: Verse) => {
    try {
      await saveFavoriteVerse(verse);
      toast({
        title: 'Versículo salvo',
        description: 'Versículo adicionado aos seus favoritos'
      });
      return true;
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o versículo',
        variant: 'destructive'
      });
      return false;
    }
  };

  const removeFavorite = async (verse: Verse) => {
    try {
      if (!verse.id) throw new Error('ID do versículo é necessário');
      await removeFavoriteVerse(verse.id.toString());
      toast({
        title: 'Versículo removido',
        description: 'Versículo removido dos seus favoritos'
      });
      return true;
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o versículo',
        variant: 'destructive'
      });
      return false;
    }
  };

  const isFavorite = async (verse: Verse) => {
    if (!verse.book_id || !verse.chapter || !verse.verse) return false;
    return await isFavoriteVerse(verse.book_id, verse.chapter, verse.verse);
  };

  return {
    addFavorite,
    removeFavorite,
    isFavorite
  };
}
