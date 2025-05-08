
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Suggestion } from '@/services/suggestionsService';

interface ChatHistoryItem {
  id: string;
  user_id: string;
  slug: string;
  check_item: boolean;
  book_slug: string;
}

export interface StudySuggestionItem extends Suggestion {
  isCompleted: boolean;
}

export function useStudySuggestions(bookSlug: string) {
  const [suggestions, setSuggestions] = useState<StudySuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);
  const { toast } = useToast();
  
  // Get the current user's session
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUserId(data.session.user.id);
      }
    };
    
    getSession();
  }, []);
  
  // Load suggestions and completed status
  useEffect(() => {
    const loadSuggestions = async () => {
      if (!bookSlug) return;
      
      setIsLoading(true);
      try {
        // Load all suggestions for this book
        const { data: suggestionsData, error: suggestionsError } = await supabase
          .from('bible_suggestions')
          .select('*')
          .eq('book_slug', bookSlug)
          .order('display_order', { ascending: true });
          
        if (suggestionsError) throw suggestionsError;
        
        if (!userId) {
          // Not logged in, return suggestions without completion status
          setSuggestions(suggestionsData.map(item => ({
            ...item,
            isCompleted: false
          })));
          setIsLoading(false);
          return;
        }
        
        // Load chat history entries with check_item true for this user and book
        const { data: historyData, error: historyError } = await supabase
          .from('chat_history')
          .select('slug, check_item')
          .eq('user_id', userId)
          .eq('book_slug', bookSlug)
          .eq('check_item', true);
          
        if (historyError) throw historyError;
        
        // Create a set of completed suggestion slugs for faster lookup
        const completedSlugs = new Set(historyData?.map(item => item.slug) || []);
        
        // Merge suggestions with completion status
        const mergedSuggestions = suggestionsData.map(suggestion => ({
          ...suggestion,
          isCompleted: completedSlugs.has(suggestion.id)
        }));
        
        setSuggestions(mergedSuggestions);
        setCompletedCount(completedSlugs.size);
      } catch (error) {
        console.error('Error loading study suggestions:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as sugestões de estudo",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSuggestions();
    
    // Set up realtime subscription if user is logged in
    if (userId && bookSlug) {
      const channel = supabase
        .channel('study-progress-changes')
        .on('postgres_changes', 
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'chat_history',
            filter: `user_id=eq.${userId} AND book_slug=eq.${bookSlug} AND check_item=eq.true`
          }, 
          () => {
            // Reload suggestions when there's a change
            loadSuggestions();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [bookSlug, userId, toast]);
  
  // Toggle completion status of a suggestion
  const toggleSuggestionCompleted = async (suggestion: Suggestion) => {
    if (!userId) {
      toast({
        title: "Autenticação necessária",
        description: "Você precisa estar logado para salvar seu progresso",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Find if there's already a chat history entry for this suggestion
      const { data: existingEntries } = await supabase
        .from('chat_history')
        .select('id, check_item')
        .eq('user_id', userId)
        .eq('slug', suggestion.id)
        .maybeSingle();
      
      if (existingEntries) {
        // Toggle the check_item field
        const newValue = !existingEntries.check_item;
        
        await supabase
          .from('chat_history')
          .update({ check_item: newValue })
          .eq('id', existingEntries.id);
        
        // Update local state
        setSuggestions(prev => 
          prev.map(item => 
            item.id === suggestion.id 
              ? { ...item, isCompleted: newValue } 
              : item
          )
        );
        
        // Update completed count
        setCompletedCount(prev => newValue ? prev + 1 : prev - 1);
      } else {
        // Create new entry with check_item set to true
        await supabase
          .from('chat_history')
          .insert({
            user_id: userId,
            slug: suggestion.id,
            title: suggestion.label,
            book_slug: bookSlug,
            messages: JSON.stringify([]),
            last_message: '',
            check_item: true
          });
        
        // Update local state
        setSuggestions(prev => 
          prev.map(item => 
            item.id === suggestion.id 
              ? { ...item, isCompleted: true } 
              : item
          )
        );
        
        // Update completed count
        setCompletedCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling suggestion completion:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da questão",
        variant: "destructive"
      });
    }
  };
  
  return {
    suggestions,
    isLoading,
    toggleSuggestionCompleted,
    completedCount,
    totalCount: suggestions.length,
    progress: suggestions.length > 0 ? Math.floor((completedCount / suggestions.length) * 100) : 0
  };
}
