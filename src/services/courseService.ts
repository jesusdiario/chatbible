
import { supabase } from '@/integrations/supabase/client';

// Este arquivo contém apenas stubs/placeholders das funções relacionadas a cursos
// A funcionalidade de cursos foi descontinuada

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
