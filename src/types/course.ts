
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
