
// Este arquivo está sendo mantido como um placeholder
// A funcionalidade de cursos foi descontinuada
// As interfaces abaixo são mantidas apenas para compatibilidade com código legado

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
}

export interface Section {
  id: string;
  course_id: string;
  title: string;
  position: number;
}

export interface Lesson {
  id: string;
  section_id: string;
  title: string;
  video_url: string | null;
  duration: number | null;
  position: number;
}

export interface Instructor {
  id: string;
  display_name: string;
}

export interface CourseReview {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  comment: string;
  submitted_at: string;
}

export interface CourseTab {
  label: string;
  value: string;
}
