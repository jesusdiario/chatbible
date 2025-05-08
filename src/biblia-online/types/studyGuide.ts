
import { Verse } from '@/types/biblia';

export interface StudyGuideQuestion {
  id: string;
  book_slug?: string;
  label: string;
  user_message: string;
  prompt_override?: string;
  icon?: string;
  display_order: number;
  isCompleted?: boolean;
}

export interface StudyGuideProgress {
  id: string;
  user_id: string;
  question_id: string;
  book_slug?: string;
  completed_at: string;
  is_completed: boolean;
}

export type StudyGuideFilter = 'all' | 'completed' | 'pending';
