export type CourseLevel = 'iniciante' | 'intermediário' | 'avançado';

export interface Course {
  id: string;
  title: string;
  description: string | null;
  level: CourseLevel;
  language: string;
  total_hours: number | null;
  created_by: string | null;
  created_at: string;
  rating?: number;
  student_count?: number;
  image_url?: string;
  price?: number;
  original_price?: number;
}

export interface Section {
  id: string;
  course_id: string;
  title: string;
  position: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  section_id: string;
  title: string;
  video_url: string | null;
  duration: number | null;
  position: number;
  is_locked?: boolean;
}

export interface Instructor {
  id: string;
  display_name: string;
  title?: string;
  avatar_url?: string;
}

export interface CourseReview {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  comment: string;
  submitted_at: string;
  user?: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface CourseTab {
  label: string;
  value: string;
}
