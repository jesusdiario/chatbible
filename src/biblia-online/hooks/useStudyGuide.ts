
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/biblia-online/integrations/supabase/client';
import { StudyGuideQuestion, StudyGuideProgress, StudyGuideFilter } from '../types/studyGuide';
import { useToast } from '@/hooks/use-toast';

export function useStudyGuide(bookSlug?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<StudyGuideQuestion[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<StudyGuideFilter>('all');
  const [completionRate, setCompletionRate] = useState(0);

  // Fetch study guide questions
  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const query = supabase
        .from('bible_suggestions')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (bookSlug) {
        query.eq('book_slug', bookSlug);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        setQuestions(data as StudyGuideQuestion[]);
      }
    } catch (error) {
      console.error('Error fetching study guide questions:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o guia de estudo',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [bookSlug, toast]);

  // Fetch user progress
  const fetchUserProgress = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('study_guide_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (data) {
        const progressMap: Record<string, boolean> = {};
        data.forEach((item: StudyGuideProgress) => {
          progressMap[item.question_id] = item.is_completed;
        });
        setUserProgress(progressMap);
        
        // Calculate completion rate
        if (questions.length > 0) {
          const completedCount = Object.values(progressMap).filter(Boolean).length;
          setCompletionRate(Math.round((completedCount / questions.length) * 100));
        }
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  }, [user, questions.length]);

  // Toggle question completion
  const toggleQuestionCompletion = useCallback(async (question: StudyGuideQuestion) => {
    if (!user) {
      toast({
        title: 'Atenção',
        description: 'Você precisa estar logado para salvar seu progresso',
        variant: 'default',
      });
      return;
    }

    const isCurrentlyCompleted = userProgress[question.id] || false;
    const newStatus = !isCurrentlyCompleted;
    
    // Optimistic update
    setUserProgress(prev => ({
      ...prev,
      [question.id]: newStatus
    }));
    
    try {
      const { error } = await supabase
        .from('study_guide_progress')
        .upsert({
          user_id: user.id,
          question_id: question.id,
          book_slug: question.book_slug,
          is_completed: newStatus,
          completed_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Recalculate completion rate
      const updatedProgress = { ...userProgress, [question.id]: newStatus };
      const completedCount = Object.values(updatedProgress).filter(Boolean).length;
      setCompletionRate(Math.round((completedCount / questions.length) * 100));
      
      toast({
        title: newStatus ? 'Pergunta concluída' : 'Pergunta desmarcada',
        description: newStatus 
          ? 'Esta pergunta foi marcada como concluída' 
          : 'Esta pergunta foi desmarcada',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error updating question status:', error);
      
      // Revert optimistic update on error
      setUserProgress(prev => ({
        ...prev,
        [question.id]: isCurrentlyCompleted
      }));
      
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar seu progresso',
        variant: 'destructive',
      });
    }
  }, [user, userProgress, questions.length, toast]);

  // Setup realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('study-guide-changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'study_guide_progress',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          fetchUserProgress();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchUserProgress]);

  // Load data on component mount
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Update progress whenever questions change
  useEffect(() => {
    if (questions.length > 0) {
      fetchUserProgress();
    }
  }, [questions, fetchUserProgress]);

  // Get filtered questions
  const getFilteredQuestions = useCallback(() => {
    if (filter === 'all') {
      return questions;
    } else if (filter === 'completed') {
      return questions.filter(q => userProgress[q.id]);
    } else { // pending
      return questions.filter(q => !userProgress[q.id]);
    }
  }, [questions, userProgress, filter]);

  return {
    questions: getFilteredQuestions(),
    allQuestions: questions,
    userProgress,
    isLoading,
    filter,
    setFilter,
    completionRate,
    toggleQuestionCompletion,
    isQuestionCompleted: (questionId: string) => !!userProgress[questionId],
  };
}
