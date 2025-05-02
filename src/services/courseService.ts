import { supabase } from '@/integrations/supabase/client';
import { Course, Section, Lesson } from '@/types/course';

// Este arquivo está sendo mantido como um placeholder
// A funcionalidade de cursos foi descontinuada
// Mantemos este arquivo vazio para evitar erros de importação em arquivos que possam ainda não ter sido atualizados

export async function fetchCourses() {
  return [];
}

export async function fetchCourseById() {
  return null;
}

export async function createCourse() {
  throw new Error("Funcionalidade de cursos foi descontinuada");
}

export async function fetchPopularCourses() {
  return [];
}

export async function fetchCourseDetails() {
  return null;
}

export async function enrollInCourse() {
  throw new Error("Funcionalidade de cursos foi descontinuada");
}

export async function checkEnrollmentStatus() {
  return false;
}
