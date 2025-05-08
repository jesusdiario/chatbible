
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StudyGuideQuestion } from '@/biblia-online/types/studyGuide';
import { motion } from 'framer-motion';

interface StudyGuideQuestionItemProps {
  question: StudyGuideQuestion;
  isCompleted: boolean;
  onToggle: (question: StudyGuideQuestion) => void;
  onClick: (question: StudyGuideQuestion) => void;
}

export function StudyGuideQuestionItem({
  question,
  isCompleted,
  onToggle,
  onClick
}: StudyGuideQuestionItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex items-center justify-between p-3 rounded-md border mb-2 cursor-pointer hover:scale-[1.01] transition-all duration-200",
        isCompleted 
          ? "bg-amber-50 border-amber-200" 
          : "bg-white border-gray-200 hover:bg-gray-50"
      )}
      onClick={() => onClick(question)}
    >
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{question.label}</p>
      </div>
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onToggle(question);
        }}
        className={cn(
          "ml-2 p-1 rounded-full transition-all duration-200",
          isCompleted ? "bg-green-100" : "bg-gray-100 hover:bg-gray-200"
        )}
      >
        <CheckCircle 
          size={18} 
          className={cn(
            "transition-colors duration-200",
            isCompleted ? "text-green-600" : "text-gray-400"
          )} 
        />
      </div>
    </motion.div>
  );
}
