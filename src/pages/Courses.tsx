
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCourses, fetchPopularCourses } from '@/services/courseService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { useSidebarControl } from '@/hooks/useSidebarControl';
import ChatHeader from '@/components/ChatHeader';

const MentorCard = ({ mentor }: { mentor: any }) => (
  <div className="flex flex-col items-center p-2">
    <div className="h-14 w-14 rounded-full overflow-hidden mb-2">
      <img 
        src={mentor.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${mentor.name}`} 
        alt={mentor.name} 
        className="h-full w-full object-cover"
      />
    </div>
    <p className="text-xs text-center truncate w-full">{mentor.name}</p>
  </div>
);

const CourseCard = ({ course }: { course: any }) => (
  <Card className="overflow-hidden hover:shadow-md transition-shadow">
    <div className="h-40 overflow-hidden bg-gray-100">
      <img 
        src={course.image_url || `https://api.dicebear.com/6.x/shapes/svg?seed=${course.id}`} 
        alt={course.title} 
        className="h-full w-full object-cover"
      />
    </div>
    <CardHeader className="p-4 pb-2">
      <div className="flex justify-between items-start">
        <Badge className="mb-2">{course.category || course.level}</Badge>
        <div className="flex items-center text-amber-500">
          <Star className="h-4 w-4 fill-amber-500" />
          <span className="text-xs ml-1">{course.rating || '4.8'}</span>
        </div>
      </div>
      <CardTitle className="text-base">{course.title}</CardTitle>
      <CardDescription className="text-sm line-clamp-2">
        {course.description || 'Curso sobre ' + course.title}
      </CardDescription>
    </CardHeader>
    <CardFooter className="p-4 pt-2 flex justify-between items-center">
      <div className="flex items-center">
        <span className="text-sm font-semibold text-blue-600">R${course.price || '40'}</span>
        {course.original_price && (
          <span className="text-xs line-through text-gray-400 ml-2">R${course.original_price}</span>
        )}
      </div>
      <div className="text-xs text-gray-500">{course.student_count || '830'} alunos</div>
    </CardFooter>
  </Card>
);

export default function CoursesPage() {
  const { toast } = useToast();
  const { isSidebarOpen, toggleSidebar } = useSidebarControl();
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const { data: courses, isLoading: isCoursesLoading, error: coursesError } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });

  const { data: popularCourses, isLoading: isPopularLoading } = useQuery({
    queryKey: ['popular-courses'],
    queryFn: () => fetchPopularCourses(6),
  });

  const mentors = [
    { id: 1, name: 'Jacob', avatar: 'https://api.dicebear.com/6.x/personas/svg?seed=Jacob' },
    { id: 2, name: 'Claire', avatar: 'https://api.dicebear.com/6.x/personas/svg?seed=Claire' },
    { id: 3, name: 'Priscila', avatar: 'https://api.dicebear.com/6.x/personas/svg?seed=Priscila' },
    { id: 4, name: 'Wade', avatar: 'https://api.dicebear.com/6.x/personas/svg?seed=Wade' },
    { id: 5, name: 'Kathryn', avatar: 'https://api.dicebear.com/6.x/personas/svg?seed=Kathryn' },
  ];

  const categories = [
    { id: 'ai', name: 'AI' },
    { id: '3d-design', name: '3D Design' },
    { id: 'business', name: 'Business' },
    { id: 'dev', name: 'Desenvolvimento' },
    { id: 'design', name: 'UX Design' },
  ];

  if (coursesError) {
    toast({
      variant: "destructive",
      title: "Erro ao carregar cursos",
      description: "Não foi possível carregar a lista de cursos."
    });
  }

  if (isCoursesLoading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={toggleSidebar} 
        />
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
          <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
          <div className="pt-[60px] flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar} 
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
        <div className="pt-[60px] px-4 md:px-8 py-6">
          
          {/* Header and search */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-1">Bom dia! 👋</h1>
              <p className="text-gray-500">O que você deseja aprender hoje?</p>
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Buscar cursos..." 
                  className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {/* Discount Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl p-6 mb-8 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 font-semibold">Today's Special</p>
                  <h2 className="text-2xl font-bold mb-2">40% OFF</h2>
                  <p className="text-sm text-blue-100 mb-4 max-w-sm">
                    Receba um desconto em todos os cursos hoje!
                    Apenas válido para hoje.
                  </p>
                </div>
                <div className="text-4xl font-bold">40%</div>
              </div>
              <Button 
                variant="minimal" 
                className="bg-white text-blue-600 hover:bg-blue-50"
                size="sm"
              >
                Ver detalhes
              </Button>
            </div>
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-blue-500 rounded-full -mb-16 -mr-16 opacity-50"></div>
            <div className="absolute right-12 bottom-0 w-24 h-24 bg-blue-300 rounded-full -mb-10 -mr-10 opacity-30"></div>
          </div>
          
          {/* Top Mentors */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Top Mentores</h2>
              <Link to="/mentors" className="text-sm text-blue-600">Ver todos</Link>
            </div>
            <div className="flex overflow-x-auto space-x-4 pb-2">
              {mentors.map(mentor => (
                <MentorCard key={mentor.id} mentor={mentor} />
              ))}
            </div>
          </div>
          
          {/* Popular Courses */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Cursos Populares</h2>
              <Link to="/courses/popular" className="text-sm text-blue-600">Ver todos</Link>
            </div>
            
            {/* Categories Filter */}
            <div className="flex overflow-x-auto space-x-2 mb-4 pb-2">
              {categories.map(category => (
                <Badge 
                  key={category.id} 
                  variant="outline"
                  className="cursor-pointer px-4 py-2 whitespace-nowrap"
                >
                  {category.name}
                </Badge>
              ))}
            </div>
            
            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(popularCourses || courses || []).slice(0, 6).map((course) => (
                <Link to={`/course/${course.id}`} key={course.id}>
                  <CourseCard course={course} />
                </Link>
              ))}
            </div>
          </div>
          
          {/* All Courses */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Todos os Cursos</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(courses || []).map((course) => (
                <Link to={`/course/${course.id}`} key={course.id}>
                  <CourseCard course={course} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
