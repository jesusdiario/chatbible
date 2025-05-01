
import { supabase } from '@/integrations/supabase/client';
import { Course, Section, Lesson } from '@/types/course';

export async function fetchCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Course[];
}

export async function fetchCourseById(id: string) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      sections (
        *,
        lessons (*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createCourse(course: Omit<Course, 'id' | 'created_at' | 'created_by'>) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('courses')
    .insert({
      ...course,
      created_by: userData.user.id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchPopularCourses(limit = 6) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Course[];
}

export async function fetchCourseDetails(courseId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      sections (
        *,
        lessons (*)
      ),
      feedbacks (*)
    `)
    .eq('id', courseId)
    .single();

  if (error) throw error;
  return data;
}

export async function enrollInCourse(courseId: string, userId: string) {
  const { data, error } = await supabase
    .from('course_progress')
    .insert({
      course_id: courseId,
      user_id: userId,
      completed_lessons: []
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function checkEnrollmentStatus(courseId: string, userId: string) {
  const { data, error } = await supabase
    .from('course_progress')
    .select('*')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}
