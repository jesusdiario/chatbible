
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Book } from 'lucide-react';
import { useStudyGuide } from '@/biblia-online/hooks/useStudyGuide';
import { StudyGuideQuestion } from '@/biblia-online/types/studyGuide';
import { StudyGuideQuestionItem } from './StudyGuideQuestionItem';
import { StudyGuideProgressBar } from './StudyGuideProgressBar';
import { StudyGuideFilterBar } from './StudyGuideFilterBar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StudyGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookSlug?: string;
  onQuestionSelect: (question: StudyGuideQuestion) => void;
}

export function StudyGuideModal({
  open,
  onOpenChange,
  bookSlug,
  onQuestionSelect
}: StudyGuideModalProps) {
  const {
    questions,
    allQuestions,
    userProgress,
    isLoading,
    filter,
    setFilter,
    completionRate,
    toggleQuestionCompletion,
    isQuestionCompleted
  } = useStudyGuide(bookSlug);
  
  const handleQuestionClick = (question: StudyGuideQuestion) => {
    onQuestionSelect(question);
    onOpenChange(false);
  };
  
  const counts = {
    all: allQuestions.length,
    completed: Object.values(userProgress).filter(Boolean).length,
    pending: allQuestions.length - Object.values(userProgress).filter(Boolean).length
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            <span>Guia de Estudo</span>
          </DialogTitle>
        </DialogHeader>
        
        {/* Progress bar */}
        <div className="mb-4">
          <StudyGuideProgressBar value={completionRate} />
        </div>
        
        {/* Filters */}
        <StudyGuideFilterBar
          filter={filter}
          setFilter={setFilter}
          counts={counts}
        />
        
        {/* Questions list */}
        <ScrollArea className="h-[50vh] pr-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-gray-500">Carregando perguntas...</p>
            </div>
          ) : questions.length > 0 ? (
            questions.map(question => (
              <StudyGuideQuestionItem
                key={question.id}
                question={question}
                isCompleted={isQuestionCompleted(question.id)}
                onToggle={toggleQuestionCompletion}
                onClick={handleQuestionClick}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {filter !== 'all' ? (
                <p>Nenhuma pergunta {filter === 'completed' ? 'concluída' : 'pendente'} encontrada.</p>
              ) : (
                <p>Nenhuma pergunta disponível para este livro.</p>
              )}
            </div>
          )}
        </ScrollArea>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
