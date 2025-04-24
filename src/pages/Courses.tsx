
import { useQuery } from '@tanstack/react-query';
import { fetchCourses } from '@/services/courseService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CoursesPage() {
  const { toast } = useToast();
  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });

  if (error) {
    toast({
      variant: "destructive",
      title: "Erro ao carregar cursos",
      description: "Não foi possível carregar a lista de cursos."
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Cursos Disponíveis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              <CardDescription>Nível: {course.level}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{course.description}</p>
              {course.total_hours && (
                <p className="text-sm text-gray-500 mt-2">
                  Duração: {course.total_hours} horas
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
