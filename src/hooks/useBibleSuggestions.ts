
import { useQuery } from '@tanstack/react-query';
import { loadSuggestionsForBook, Suggestion } from '@/services/suggestionsService';

export function useBibleSuggestions(bookSlug: string) {
  return useQuery({
    queryKey: ['bible_suggestions', bookSlug],
    queryFn: () => loadSuggestionsForBook(bookSlug),
    staleTime: 1000 * 60 * 60 // 1 hour cache
  });
}
