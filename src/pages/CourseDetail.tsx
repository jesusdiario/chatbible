import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { fetchCourseDetails, checkEnrollmentStatus, enrollInCourse } from '@/services/courseService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Star, Clock, Award, Check, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';
import { useSidebarControl } from '@/hooks/useSidebarControl';
import ChatHeader from '@/components/ChatHeader';
import { supabase } from '@/integrations/supabase/client';

const LessonItem = ({ lesson, isLocked = false }: { lesson: any, isLocked?: boolean }) => {
  return (
    <div className="border-b last:border-b-0 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 bg-blue-50 h-8 w-8 flex items-center justify-center rounded-md">
            <span className="text-xs font-semibold">{lesson.position || '1'}</span>
          </div>
          <div>
            <h4 className="text-sm font-medium">{lesson.title}</h4>
            <div className="flex items-center mt-1">
              <Clock className="w-3 h-3 text-gray-400 mr-1" />
              <span className="text-xs text-gray-500">{lesson.duration || 10} mins</span>
            </div>
          </div>
        </div>
        {isLocked ? (
          <div className="flex items-center text-gray-400">
            <span className="text-xs mr-2">Bloqueado</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
        ) : (
          <div className="flex items-center text-blue-500">
            <span className="text-xs mr-2">Disponível</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

const SectionItem = ({ section, index }: { section: any, index: number }) => {
  const [isOpen, setIsOpen] = useState(index === 0);

  return (
    <div className="mb-4 border rounded-lg overflow-hidden">
      <div 
        className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h3 className="font-medium">Seção {index + 1}: {section.title}</h3>
          <div className="text-sm text-gray-500 mt-1">{section.lessons?.length || 0} aulas</div>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-3">{section.duration || `${index * 20 + 15} mins`}</span>
          <ChevronDown className={`transition-transform ${isOpen ? 'transform rotate-180' : ''}`} size={18} />
        </div>
      </div>
      
      {isOpen && (
        <div className="p-2">
          {section.lessons?.map((lesson: any, i: number) => (
            <LessonItem key={lesson.id} lesson={lesson} isLocked={lesson.is_locked || i > 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const ReviewItem = ({ review }: { review: any }) => {
  return (
    <div className="border-b last:border-b-0 py-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
          <img 
            src={review.user?.avatar_url || `https://api.dicebear.com/6.x/initials/svg?seed=${review.user?.display_name || 'User'}`} 
            alt={review.user?.display_name || 'User'} 
            className="h-full w-full object-cover" 
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{review.user?.display_name || 'Usuário Anônimo'}</h4>
            <div className="flex items-center">
              <Badge variant="outline" className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                <span>{review.rating}</span>
              </Badge>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
          <div className="text-xs text-gray-400 mt-2">
            {new Date(review.submitted_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { isSidebarOpen, toggleSidebar } = useSidebarControl();
  const [enrolling, setEnrolling] = useState(false);
  
  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', id],
    queryFn: () => fetchCourseDetails(id!),
    enabled: !!id,
  });

  const { data: isEnrolled } = useQuery({
    queryKey: ['enrollment', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      return checkEnrollmentStatus(id!, user.id);
    },
    enabled: !!id,
  });

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Erro ao se inscrever",
          description: "Você precisa estar logado para se inscrever em um curso."
        });
        return;
      }
      
      await enrollInCourse(id!, user.id);
      toast({
        title: "Inscrição realizada com sucesso!",
        description: "Você agora tem acesso a este curso."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao se inscrever",
        description: "Não foi possível completar sua inscrição. Tente novamente."
      });
    } finally {
      setEnrolling(false);
    }
  };

  if (error) {
    toast({
      variant: "destructive",
      title: "Erro ao carregar curso",
      description: "Não foi possível carregar os detalhes do curso."
    });
  }

  if (isLoading) {
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

  // Demo instructor data since we don't have it in the database yet
  const instructor = {
    name: "Jonathan Williams",
    title: "Senior UI/UX Designer at Google",
    avatar: "https://api.dicebear.com/6.x/personas/svg?seed=Jonathan"
  };

  // Mock reviews if needed
  const reviews = [
    {
      id: 1,
      rating: 5,
      comment: "O curso é muito bom. A explicação do mentor é clara e fácil de entender!",
      submitted_at: "2025-04-28T10:30:00Z",
      user: {
        display_name: "Mariella Wigington",
        avatar_url: "https://api.dicebear.com/6.x/personas/svg?seed=Mariella"
      }
    },
    {
      id: 2,
      rating: 4,
      comment: "Extraordinário! Eu finalizei e realmente ajudou.",
      submitted_at: "2025-04-27T15:20:00Z",
      user: {
        display_name: "Tanner Stafford",
        avatar_url: "https://api.dicebear.com/6.x/personas/svg?seed=Tanner"
      }
    },
    {
      id: 3,
      rating: 5,
      comment: "Incrível! Foi exatamente o que eu estava procurando, recomendo a todos!",
      submitted_at: "2025-04-26T09:15:00Z",
      user: {
        display_name: "Lourdes Quintero",
        avatar_url: "https://api.dicebear.com/6.x/personas/svg?seed=Lourdes"
      }
    }
  ];

  const sections = course?.sections || [];
  const totalLessons = sections.reduce((acc, section) => acc + (section.lessons?.length || 0), 0);
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar} 
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
        <div className="pt-[60px] pb-8">
          {/* Course Header */}
          <div className="bg-white border-b">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center mb-4">
                <Badge>{course?.level}</Badge>
                <div className="flex items-center ml-4 text-amber-500">
                  <Star className="h-4 w-4 fill-amber-500" />
                  <span className="ml-1 text-sm">4.8 (4,479 avaliações)</span>
                </div>
              </div>
              
              <h1 className="text-2xl font-bold mb-4">{course?.title}</h1>
              
              <div className="flex items-center mb-6 gap-4 flex-wrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                    <img 
                      src={instructor.avatar} 
                      alt={instructor.name} 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{instructor.name}</p>
                    <p className="text-xs text-gray-500">{instructor.title}</p>
                  </div>
                </div>
                
                <div className="flex items-center ml-auto gap-4">
                  <div>
                    <span className="text-2xl font-bold text-blue-600">R$40</span>
                    <span className="text-gray-400 line-through ml-2">R$75</span>
                  </div>
                  
                  {isEnrolled ? (
                    <Button disabled className="bg-green-600 hover:bg-green-700">
                      <Check className="mr-2 h-4 w-4" />
                      Inscrito
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleEnroll}
                      disabled={enrolling}
                    >
                      {enrolling ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Inscrever-se - R$40
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-start gap-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{course?.total_hours || 2.5} horas</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>{totalLessons} aulas</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>9,839 estudantes</span>
                </div>
                <div className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  <span>Certificado</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="container mx-auto px-4 py-6">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="about">Sobre</TabsTrigger>
                <TabsTrigger value="lessons">Aulas</TabsTrigger>
                <TabsTrigger value="reviews">Avaliações</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Mentor</h2>
                      <div className="flex items-center">
                        <div className="h-16 w-16 rounded-full overflow-hidden mr-4">
                          <img 
                            src={instructor.avatar} 
                            alt={instructor.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{instructor.name}</h3>
                          <p className="text-gray-600">{instructor.title}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Sobre o Curso</h2>
                      <p className="text-gray-600 leading-relaxed">
                        {course?.description || 
                          `Este curso cobre os fundamentos e práticas avançadas para dominar ${course?.title}. 
                          Aprenderá desde os conceitos básicos até técnicas avançadas usadas pelos profissionais do mercado.
                          O curso foi projetado para todos os níveis de experiência, com exercícios práticos e projetos reais.`}
                      </p>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Ferramentas</h2>
                      <div className="flex flex-wrap gap-3">
                        <Badge variant="outline" className="py-2 px-4">
                          <img src="https://api.dicebear.com/6.x/icons/svg?seed=Figma" alt="Figma" className="w-5 h-5 mr-2" />
                          Figma
                        </Badge>
                        <Badge variant="outline" className="py-2 px-4">
                          <img src="https://api.dicebear.com/6.x/icons/svg?seed=Sketch" alt="Sketch" className="w-5 h-5 mr-2" />
                          Sketch
                        </Badge>
                        <Badge variant="outline" className="py-2 px-4">
                          <img src="https://api.dicebear.com/6.x/icons/svg?seed=Adobe" alt="Adobe XD" className="w-5 h-5 mr-2" />
                          Adobe XD
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="lessons">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">{totalLessons} Aulas</h2>
                      <div className="text-sm text-gray-500">
                        Duração total: {course?.total_hours || 2.5} horas
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {sections.map((section, index) => (
                        <SectionItem key={section.id} section={section} index={index} />
                      ))}
                      
                      {sections.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          Não há aulas disponíveis para este curso ainda.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">
                        <span className="text-amber-500">4.8</span> ({reviews.length} avaliações)
                      </h2>
                      <Button variant="outline">Escrever avaliação</Button>
                    </div>
                    
                    <div>
                      {reviews.map((review) => (
                        <ReviewItem key={review.id} review={review} />
                      ))}
                      
                      {reviews.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          Ainda não há avaliações para este curso.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="mt-8 bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Cursos relacionados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* We would fetch related courses here */}
                {Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-40 overflow-hidden bg-gray-100">
                      <img 
                        src={`https://api.dicebear.com/6.x/shapes/svg?seed=${i}`}
                        alt="Course thumbnail" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1">Curso relacionado {i + 1}</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        Um curso similar que pode te interessar
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-blue-600">R$40</span>
                        <div className="flex items-center text-amber-500">
                          <Star className="h-4 w-4 fill-amber-500" />
                          <span className="text-xs ml-1">4.{i + 6}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              {isEnrolled ? (
                <Button className="w-full md:w-auto" size="lg">
                  Continuar aprendendo
                </Button>
              ) : (
                <Button 
                  className="w-full md:w-auto" 
                  size="lg"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Inscrever-se no curso - R$40
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
