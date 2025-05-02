
import { useQuery } from '@tanstack/react-query';
import { getTestaments } from '@/services/bibleService';
import { Testament } from '@/types/bible';

export function useBibliaData() {
  const { 
    data: testaments = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['testaments_with_books'],
    queryFn: getTestaments
  });

  return {
    testaments,
    isLoading,
    isError,
    error
  };
}
