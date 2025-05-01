
import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from 'react-router-dom';
import { 
  Book, 
  MessageSquare, 
  Star, 
  Users, 
  Check, 
  ArrowDown,
  Play,
  Search,
  Headphones,
  List,
  Calendar,
  Info,
  BookOpen,
  Rocket,
  Award,
  Heart,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    
    checkAuth();
    
    // Adicionando animações de entrada
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, []);
  
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate('/');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* 1. Hero Section */}
      <section ref={heroRef} className="relative py-24 px-4 md:px-8 lg:px-16 flex flex-col items-center justify-center min-h-[90vh] bg-gradient-to-b from-chatgpt-main to-chatgpt-secondary">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="animate-on-scroll mb-6">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-chatgpt-accent to-chatgpt-accent/70">
              Bible Chat
            </h1>
            <p className="text-2xl md:text-3xl font-medium mb-6">
              Converse com a Palavra de Deus
            </p>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Uma experiência revolucionária de estudo bíblico através de inteligência artificial especializada nos 66 livros da Bíblia
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center gap-4 mb-12 animate-on-scroll">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-chatgpt-accent hover:bg-chatgpt-accent/90 text-white font-medium px-8"
            >
              Começar Agora
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => scrollToSection(benefitsRef)}
              className="border-chatgpt-accent text-chatgpt-accent hover:bg-chatgpt-accent/10"
            >
              Ver Benefícios <ArrowDown className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="relative aspect-video max-w-3xl mx-auto rounded-xl overflow-hidden shadow-2xl animate-on-scroll">
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer group">
              <div className="w-16 h-16 bg-chatgpt-accent rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                <Play className="h-8 w-8 text-white ml-1" />
              </div>
            </div>
            <img 
              src="/lovable-uploads/logo-jd-bible-chat.png" 
              alt="Bible Chat Interface" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 2. Problema Section */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">O Desafio do Estudo Bíblico</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Muitos cristãos enfrentam dificuldades para entender profundamente a Bíblia e aplicá-la em suas vidas cotidianas
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-on-scroll">
              <Card className="border-none shadow-lg">
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-red-100 p-3 rounded-lg">
                        <Info className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-1">Complexidade Textual</h3>
                        <p className="text-gray-600">Textos bíblicos antigos com contextos históricos e culturais difíceis de compreender</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <Calendar className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-1">Falta de Tempo</h3>
                        <p className="text-gray-600">Rotina agitada que dificulta dedicar tempo para estudo bíblico aprofundado</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-yellow-100 p-3 rounded-lg">
                        <Search className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-1">Dúvidas sem Resposta</h3>
                        <p className="text-gray-600">Perguntas teológicas e práticas que nem sempre encontram respostas acessíveis</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="animate-on-scroll">
              <h3 className="text-2xl font-semibold mb-4">Você já se perguntou:</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="bg-chatgpt-accent/10 p-1 rounded text-chatgpt-accent mt-0.5">
                    <ArrowDown className="h-5 w-5" />
                  </span>
                  <p className="text-lg">"Como aplicar esta passagem na minha vida hoje?"</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-chatgpt-accent/10 p-1 rounded text-chatgpt-accent mt-0.5">
                    <ArrowDown className="h-5 w-5" />
                  </span>
                  <p className="text-lg">"Qual o significado deste versículo no contexto original?"</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-chatgpt-accent/10 p-1 rounded text-chatgpt-accent mt-0.5">
                    <ArrowDown className="h-5 w-5" />
                  </span>
                  <p className="text-lg">"Como preparar um estudo bíblico sobre este tema?"</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* NOVA SEÇÃO: Cinco Pilares do Conhecimento Bíblico */}
      <section ref={benefitsRef} className="py-20 px-4 md:px-8 bg-chatgpt-secondary">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Cinco Pilares do Conhecimento Bíblico</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              O Bible Chat fundamenta-se em princípios sólidos para transformar seu estudo da Palavra
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            <div className="animate-on-scroll">
              <Card className="h-full border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="p-3 bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Contexto Histórico</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Compreensão dos cenários históricos, culturais e geográficos que dão sentido ao texto bíblico.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="animate-on-scroll">
              <Card className="h-full border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="p-3 bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <List className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Análise Textual</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Exame detalhado das palavras originais, estrutura literária e significados nas línguas bíblicas.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="animate-on-scroll">
              <Card className="h-full border-t-4 border-t-purple-500 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="p-3 bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <Book className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Coerência Bíblica</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Integração harmoniosa de todas as partes das Escrituras, respeitando sua unidade como revelação.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="animate-on-scroll">
              <Card className="h-full border-t-4 border-t-orange-500 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="p-3 bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg">Aplicação Prática</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Ponte entre os princípios eternos e os desafios contemporâneos para transformação pessoal.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="animate-on-scroll">
              <Card className="h-full border-t-4 border-t-red-500 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="p-3 bg-red-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle className="text-lg">Ortodoxia Teológica</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Compromisso com doutrinas fundamentais reconhecidas pelo cristianismo histórico.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* NOVA SEÇÃO: Benefícios Para o Crescimento Espiritual */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Benefícios Para o Crescimento Espiritual</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Como o Bible Chat fortalece sua jornada de fé e transforma sua relação com as Escrituras
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="animate-on-scroll">
              <div className="relative">
                <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-chatgpt-accent to-blue-300"></div>
                <div className="space-y-12 pl-8">
                  <div>
                    <h3 className="text-xl font-bold mb-3 flex items-center">
                      <span className="bg-chatgpt-accent text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3">1</span>
                      Consistência nos Devocionais
                    </h3>
                    <p className="text-gray-600">
                      Estabeleça uma rotina diária de estudo bíblico com orientação personalizada, adaptada ao seu nível de conhecimento e disponibilidade de tempo.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-3 flex items-center">
                      <span className="bg-chatgpt-accent text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3">2</span>
                      Clareza nas Dúvidas
                    </h3>
                    <p className="text-gray-600">
                      Resolva questionamentos teológicos de forma imediata, com explicações fundamentadas na Bíblia e tradição cristã, sem julgamentos.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-3 flex items-center">
                      <span className="bg-chatgpt-accent text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3">3</span>
                      Aprofundamento Gradual
                    </h3>
                    <p className="text-gray-600">
                      Evolua do conhecimento básico para análises mais profundas da Palavra, descobrindo camadas de significado à medida que avança.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-on-scroll">
              <div className="relative">
                <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-300 to-chatgpt-accent"></div>
                <div className="space-y-12 pl-8">
                  <div>
                    <h3 className="text-xl font-bold mb-3 flex items-center">
                      <span className="bg-chatgpt-accent text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3">4</span>
                      Visão Integradora
                    </h3>
                    <p className="text-gray-600">
                      Conecte os pontos entre diferentes partes da Bíblia, reconhecendo padrões, temas recorrentes e a narrativa redentora que une toda a Escritura.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-3 flex items-center">
                      <span className="bg-chatgpt-accent text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3">5</span>
                      Aplicabilidade Imediata
                    </h3>
                    <p className="text-gray-600">
                      Traduza princípios bíblicos em ações práticas para seu cotidiano, enfrentando desafios modernos com sabedoria ancestral.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-3 flex items-center">
                      <span className="bg-chatgpt-accent text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3">6</span>
                      Comunhão Consciente
                    </h3>
                    <p className="text-gray-600">
                      Enriqueça seus momentos de oração com insights das Escrituras, criando uma conexão mais profunda entre sua vida devocional e o conhecimento bíblico.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NOVA SEÇÃO: Impacto no Ministério e Liderança */}
      <section className="py-20 px-4 md:px-8 bg-chatgpt-secondary">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Impacto no Ministério e Liderança</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Ferramentas poderosas para líderes que desejam potencializar seu serviço na obra de Deus
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="animate-on-scroll md:col-span-1">
              <div className="space-y-8">
                <div className="flex items-center gap-4 p-5 bg-white rounded-lg shadow-md">
                  <div className="bg-chatgpt-accent/10 p-3 rounded-full">
                    <MessageSquare className="h-6 w-6 text-chatgpt-accent" />
                  </div>
                  <p className="font-medium">Sermões mais envolventes e biblicamente sólidos</p>
                </div>

                <div className="flex items-center gap-4 p-5 bg-white rounded-lg shadow-md">
                  <div className="bg-chatgpt-accent/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-chatgpt-accent" />
                  </div>
                  <p className="font-medium">Estudos bíblicos interativos para grupos</p>
                </div>

                <div className="flex items-center gap-4 p-5 bg-white rounded-lg shadow-md">
                  <div className="bg-chatgpt-accent/10 p-3 rounded-full">
                    <Book className="h-6 w-6 text-chatgpt-accent" />
                  </div>
                  <p className="font-medium">Material didático adaptado às idades</p>
                </div>
              </div>
            </div>

            <div className="animate-on-scroll md:col-span-2">
              <Card className="border-none shadow-lg h-full">
                <CardHeader>
                  <CardTitle>Como o Bible Chat Transforma seu Ministério</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Rocket className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Preparação Eficiente</h3>
                      <p className="text-gray-600">Reduza o tempo de preparação de sermões e estudos em até 50%, mantendo a qualidade teológica e relevância prática.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Award className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Excelência Exegética</h3>
                      <p className="text-gray-600">Acesse insights de comentaristas bíblicos renomados e análise contextual aprofundada para fundamentar suas exposições.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Discipulado Personalizado</h3>
                      <p className="text-gray-600">Crie roteiros de mentoria adaptados ao perfil espiritual de cada pessoa, acompanhando seu crescimento de forma sistemática.</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleGetStarted} className="bg-chatgpt-accent hover:bg-chatgpt-accent/90 text-white">
                    Potencialize Seu Ministério
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* NOVA SEÇÃO: Suporte ao Ensino Bíblico */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Suporte ao Ensino Bíblico</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Recursos especializados para educadores e professores da Palavra de Deus
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-on-scroll order-2 md:order-1">
              <img 
                src="/lovable-uploads/a70bfdc8-5c4c-4f43-8597-b7a62b57f00e.png" 
                alt="Ensino Bíblico" 
                className="rounded-xl shadow-xl w-full"
              />
            </div>

            <div className="animate-on-scroll order-1 md:order-2">
              <h3 className="text-2xl font-semibold mb-6">Transforme sua sala de aula bíblica</h3>
              
              <div className="space-y-6">
                <div className="bg-chatgpt-secondary p-5 rounded-lg">
                  <h4 className="font-bold text-lg mb-2 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-chatgpt-accent text-white flex items-center justify-center mr-3">1</span>
                    Planos de Aula Interativos
                  </h4>
                  <p className="text-gray-600 pl-11">
                    Gere roteiros de ensino com atividades participativas, perguntas para discussão e recursos visuais.
                  </p>
                </div>

                <div className="bg-chatgpt-secondary p-5 rounded-lg">
                  <h4 className="font-bold text-lg mb-2 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-chatgpt-accent text-white flex items-center justify-center mr-3">2</span>
                    Material Adaptativo
                  </h4>
                  <p className="text-gray-600 pl-11">
                    Personalize o conteúdo de acordo com a faixa etária, desde crianças pequenas até adultos com formação teológica.
                  </p>
                </div>

                <div className="bg-chatgpt-secondary p-5 rounded-lg">
                  <h4 className="font-bold text-lg mb-2 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-chatgpt-accent text-white flex items-center justify-center mr-3">3</span>
                    Ilustrações Contemporâneas
                  </h4>
                  <p className="text-gray-600 pl-11">
                    Acesse exemplos relevantes e histórias impactantes que conectam princípios bíblicos à realidade dos alunos.
                  </p>
                </div>

                <div className="bg-chatgpt-secondary p-5 rounded-lg">
                  <h4 className="font-bold text-lg mb-2 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-chatgpt-accent text-white flex items-center justify-center mr-3">4</span>
                    Continuidade Pedagógica
                  </h4>
                  <p className="text-gray-600 pl-11">
                    Desenvolva programas sequenciais que constroem conhecimento progressivamente através de módulos interligados.
                  </p>
                </div>
              </div>
              
              <div className="mt-8">
                <Button 
                  onClick={handleGetStarted}
                  className="bg-chatgpt-accent hover:bg-chatgpt-accent/90 text-white"
                >
                  Transforme Seu Ensino Hoje
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NOVA SEÇÃO: Jornada de Transformação Pessoal */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-chatgpt-accent to-blue-700 text-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Jornada de Transformação Pessoal</h2>
            <p className="text-xl max-w-3xl mx-auto text-white/90">
              Como o Bible Chat acompanha seu crescimento espiritual dia após dia
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="animate-on-scroll">
              <div className="bg-white/10 backdrop-blur p-6 rounded-xl border border-white/20 h-full">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Descoberta</h3>
                <p className="text-white/90 mb-4">
                  Inicie explorando livros bíblicos de forma guiada, construindo uma base sólida de conhecimento escriturístico.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-300" />
                    <span>Visão panorâmica dos livros</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-300" />
                    <span>Principais personagens</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-300" />
                    <span>Contexto histórico básico</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="animate-on-scroll">
              <div className="bg-white/10 backdrop-blur p-6 rounded-xl border border-white/20 h-full">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Aprofundamento</h3>
                <p className="text-white/90 mb-4">
                  Avance para estudos temáticos e análises mais profundas que conectam diferentes partes das Escrituras.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-300" />
                    <span>Estudos temáticos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-300" />
                    <span>Significados nas línguas originais</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-300" />
                    <span>Conexões teológicas</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="animate-on-scroll">
              <div className="bg-white/10 backdrop-blur p-6 rounded-xl border border-white/20 h-full">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Aplicação</h3>
                <p className="text-white/90 mb-4">
                  Traduza o conhecimento em transformação pessoal, aplicando princípios bíblicos em todas as áreas da vida.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-300" />
                    <span>Devocionais personalizados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-300" />
                    <span>Desafios práticos diários</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-300" />
                    <span>Planos de crescimento espiritual</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button 
              onClick={handleGetStarted}
              variant="outline" 
              className="border-white text-white hover:bg-white/20"
              size="lg"
            >
              Comece Sua Jornada
            </Button>
          </div>
        </div>
      </section>

      {/* 3. Solução/Benefícios - Seção Original */}
      <section ref={featuresRef} className="py-20 px-4 md:px-8 bg-chatgpt-secondary">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">A Solução Bible Chat</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Transformando a maneira como você interage com a Bíblia através da inteligência artificial
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="animate-on-scroll">
              <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="bg-chatgpt-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Book className="h-6 w-6 text-chatgpt-accent" />
                  </div>
                  <CardTitle>66 Livros da Bíblia</CardTitle>
                  <CardDescription>Explorações detalhadas de cada livro bíblico</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Acesso especializado a todos os livros da Bíblia, com conhecimento contextual, histórico e teológico para cada um deles.</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="animate-on-scroll">
              <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="bg-chatgpt-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-chatgpt-accent" />
                  </div>
                  <CardTitle>Conversas Personalizadas</CardTitle>
                  <CardDescription>Interações naturais e esclarecedoras</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Faça perguntas em linguagem natural e receba respostas claras e fundamentadas na Bíblia, adaptadas ao seu nível de conhecimento.</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="animate-on-scroll">
              <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="bg-chatgpt-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <List className="h-6 w-6 text-chatgpt-accent" />
                  </div>
                  <CardTitle>Conteúdo Ministerial</CardTitle>
                  <CardDescription>Auxílio para preparação de mensagens</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Crie esboços de sermões, estudos bíblicos, devocionais e material para ministério infantil com fundamentação teológica sólida.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Promessas */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">O Que o Bible Chat Entrega</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Compromissos que fazemos com cada usuário da nossa plataforma
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 animate-on-scroll">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Ortodoxia Cristã</h3>
                  <p className="text-gray-600">Comprometimento com a fidelidade doutrinária e respeito à autoridade das Escrituras em todas as interações.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Profundidade Teológica</h3>
                  <p className="text-gray-600">Conhecimento abrangente das diversas perspectivas teológicas e tradições cristãs históricas.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Relevância Aplicável</h3>
                  <p className="text-gray-600">Conexão entre os princípios bíblicos e os desafios contemporâneos da vida cristã.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Precisão Exegética</h3>
                  <p className="text-gray-600">Interpretação cuidadosa dos textos bíblicos, considerando contexto histórico, linguístico e cultural.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Confidencialidade</h3>
                  <p className="text-gray-600">Proteção das suas conversas e informações pessoais, garantindo um ambiente seguro para suas perguntas.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Melhoria Contínua</h3>
                  <p className="text-gray-600">Atualizações regulares para aprimorar a precisão teológica e a experiência do usuário.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Funcionalidades */}
      <section className="py-20 px-4 md:px-8 bg-chatgpt-secondary">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Recursos do Bible Chat</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Ferramentas poderosas para enriquecer seu estudo bíblico diário
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8 animate-on-scroll">
              <Card className="border border-chatgpt-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="h-5 w-5 text-chatgpt-accent" />
                    Biblioteca Bíblica Completa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Acesso aos 66 livros da Bíblia com especialização em cada um deles, permitindo perguntas específicas sobre qualquer passagem.</p>
                </CardContent>
              </Card>
              
              <Card className="border border-chatgpt-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-chatgpt-accent" />
                    Perguntas Prontas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Sugestões de perguntas relevantes para cada livro da Bíblia, ajudando você a iniciar conversas significativas.</p>
                </CardContent>
              </Card>
              
              <Card className="border border-chatgpt-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-chatgpt-accent" />
                    Histórico de Conversas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Armazenamento automático de todas as suas consultas, permitindo retomar estudos anteriores a qualquer momento.</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-8 animate-on-scroll">
              <Card className="border border-chatgpt-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <List className="h-5 w-5 text-chatgpt-accent" />
                    Templates Ministeriais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Modelos pré-formatados para criação de sermões, estudos bíblicos, aulas de escola dominical e muito mais.</p>
                </CardContent>
              </Card>
              
              <Card className="border border-chatgpt-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Headphones className="h-5 w-5 text-chatgpt-accent" />
                    Lexicon Bíblico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Consulta de termos originais em hebraico e grego, com explicações sobre seus significados e usos na Bíblia.</p>
                </CardContent>
              </Card>
              
              <Card className="border border-chatgpt-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowDown className="h-5 w-5 text-chatgpt-accent" />
                    Exportação de Conteúdo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Salve e exporte suas conversas em diversos formatos como PDF, facilitando o compartilhamento e uso posterior.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Demonstração Interativa */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Experimente o Bible Chat</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Veja como é simples conversar sobre a Bíblia com nossa IA
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl p-5 md:p-8 animate-on-scroll">
            <div className="border rounded-lg p-4 bg-chatgpt-secondary mb-6">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-chatgpt-accent font-medium">U</span>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm w-full">
                  <p>Qual é o significado da parábola do semeador em Mateus 13?</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-chatgpt-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium">BC</span>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm w-full">
                  <p className="mb-3">
                    A parábola do semeador em Mateus 13:1-23 é uma das parábolas mais importantes de Jesus, onde Ele mesmo fornece a interpretação:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 mb-3">
                    <li>O <strong>semeador</strong> representa aquele que espalha a Palavra de Deus</li>
                    <li>As diferentes <strong>solos</strong> representam os diversos corações que recebem a mensagem:</li>
                  </ul>
                  <ol className="list-decimal pl-5 space-y-2 mb-3">
                    <li><strong>Beira do caminho</strong>: pessoas que ouvem mas não entendem, e o maligno rouba a semente</li>
                    <li><strong>Terreno pedregoso</strong>: aqueles que recebem com alegria, mas sem raiz; desistem nas tribulações</li>
                    <li><strong>Entre espinhos</strong>: pessoas cuja fé é sufocada pelas preocupações da vida e ilusão das riquezas</li>
                    <li><strong>Boa terra</strong>: aqueles que ouvem, entendem e produzem frutos abundantes</li>
                  </ol>
                  <p>
                    Esta parábola nos ensina sobre a importância não apenas de ouvir a Palavra de Deus, mas de permiti-la criar raízes profundas em nossas vidas para produzirmos frutos espirituais.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-chatgpt-secondary rounded-lg px-4 py-3 flex items-center">
              <input 
                type="text" 
                placeholder="Faça sua pergunta sobre a Bíblia..." 
                className="flex-1 bg-transparent border-none outline-none"
                disabled
              />
              <Button disabled className="bg-chatgpt-accent text-white" size="sm">
                Enviar
              </Button>
            </div>
            
            <div className="text-center mt-4 text-sm text-gray-500">
              Crie sua conta para conversar com o Bible Chat agora mesmo
            </div>
          </div>
          
          <div className="text-center mt-10">
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="bg-chatgpt-accent hover:bg-chatgpt-accent/90 text-white"
            >
              Conversar com Bible Chat
            </Button>
          </div>
        </div>
      </section>

      {/* 7. Casos de Uso */}
      <section className="py-20 px-4 md:px-8 bg-chatgpt-secondary">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como Usar o Bible Chat</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Descubra as múltiplas formas de enriquecer sua caminhada espiritual
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="animate-on-scroll">
              <img 
                src="/lovable-uploads/fb2119a5-5937-4cb3-9f11-bea6e009930f.png" 
                alt="Bible Chat em uso" 
                className="rounded-lg shadow-lg mb-8 w-full"
              />
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="bg-chatgpt-accent w-8 h-8 rounded-full flex items-center justify-center text-white font-bold">1</span>
                  <h3 className="text-xl font-medium">Devocional Diário</h3>
                </div>
                <p className="text-gray-600 pl-11">
                  Peça reflexões sobre passagens bíblicas para seu tempo devocional, com aplicações práticas para sua vida.
                </p>
                
                <div className="flex items-center gap-3">
                  <span className="bg-chatgpt-accent w-8 h-8 rounded-full flex items-center justify-center text-white font-bold">2</span>
                  <h3 className="text-xl font-medium">Preparo de Sermões</h3>
                </div>
                <p className="text-gray-600 pl-11">
                  Obtenha auxílio na estruturação de mensagens, com insights exegéticos e ilustrações relevantes.
                </p>
              </div>
            </div>
            
            <div className="animate-on-scroll">
              <div className="space-y-6 mb-8">
                <div className="flex items-center gap-3">
                  <span className="bg-chatgpt-accent w-8 h-8 rounded-full flex items-center justify-center text-white font-bold">3</span>
                  <h3 className="text-xl font-medium">Estudo Temático</h3>
                </div>
                <p className="text-gray-600 pl-11">
                  Explore temas bíblicos específicos com referências cruzadas e explicações abrangentes.
                </p>
                
                <div className="flex items-center gap-3">
                  <span className="bg-chatgpt-accent w-8 h-8 rounded-full flex items-center justify-center text-white font-bold">4</span>
                  <h3 className="text-xl font-medium">Ensino para Crianças</h3>
                </div>
                <p className="text-gray-600 pl-11">
                  Crie material de ensino para crianças com ilustrações, atividades e aplicações adequadas à idade.
                </p>
                
                <div className="flex items-center gap-3">
                  <span className="bg-chatgpt-accent w-8 h-8 rounded-full flex items-center justify-center text-white font-bold">5</span>
                  <h3 className="text-xl font-medium">Esclarecimento de Dúvidas</h3>
                </div>
                <p className="text-gray-600 pl-11">
                  Obtenha respostas para perguntas teológicas complexas de forma compreensível e fundamentada.
                </p>
              </div>
              <img 
                src="/lovable-uploads/a70bfdc8-5c4c-4f43-8597-b7a62b57f00e.png" 
                alt="Livros da Bíblia" 
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 8. Depoimentos */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">O Que Nossos Usuários Dizem</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Experiências transformadoras com o Bible Chat
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="animate-on-scroll">
              <Card className="h-full border-t-4 border-t-yellow-500">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <CardTitle>"Revolucionou meu devocional"</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-6">
                    "O Bible Chat transformou meu tempo devocional. As explicações contextuais e aplicações práticas me ajudaram a entender melhor a Palavra e aplicá-la no meu dia a dia."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">Pastor Carlos Silva</p>
                      <p className="text-sm text-gray-500">Igreja Batista</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="animate-on-scroll">
              <Card className="h-full border-t-4 border-t-yellow-500">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <CardTitle>"Auxiliar indispensável"</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-6">
                    "Como líder de pequeno grupo, o Bible Chat se tornou um auxiliar indispensável na preparação dos meus estudos. As respostas são profundas e ao mesmo tempo acessíveis para todos."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">Luciana Mendes</p>
                      <p className="text-sm text-gray-500">Líder de Célula</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="animate-on-scroll">
              <Card className="h-full border-t-4 border-t-yellow-500">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <CardTitle>"Perfeito para novos cristãos"</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-6">
                    "Como novo cristão, eu tinha muitas dúvidas sobre a Bíblia. O Bible Chat me ajuda a entender conceitos complexos de forma clara, permitindo que eu cresça no conhecimento bíblico."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">André Gomes</p>
                      <p className="text-sm text-gray-500">Novo Convertido</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="py-20 px-4 md:px-8 bg-chatgpt-secondary">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Perguntas Frequentes</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Tudo o que você precisa saber sobre o Bible Chat
            </p>
          </div>
          
          <div className="space-y-4 animate-on-scroll">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <details className="group">
                <summary className="flex justify-between items-center p-4 cursor-pointer">
                  <h3 className="font-medium text-lg">O Bible Chat substitui a leitura da Bíblia?</h3>
                  <span className="transition-transform duration-200 group-open:rotate-180">
                    <ArrowDown className="h-5 w-5" />
                  </span>
                </summary>
                <div className="p-4 pt-0 border-t">
                  <p className="text-gray-600">
                    Não. O Bible Chat foi projetado para <strong>complementar</strong> sua leitura da Bíblia, não substituí-la. Nosso objetivo é ajudar você a compreender melhor as Escrituras e aprofundar seu relacionamento com Deus através de Sua Palavra.
                  </p>
                </div>
              </details>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <details className="group">
                <summary className="flex justify-between items-center p-4 cursor-pointer">
                  <h3 className="font-medium text-lg">As respostas do Bible Chat são teologicamente precisas?</h3>
                  <span className="transition-transform duration-200 group-open:rotate-180">
                    <ArrowDown className="h-5 w-5" />
                  </span>
                </summary>
                <div className="p-4 pt-0 border-t">
                  <p className="text-gray-600">
                    O Bible Chat foi treinado com conhecimento teológico sólido e fundamentado na ortodoxia cristã. Trabalhamos continuamente para garantir a precisão das respostas, mas sempre recomendamos verificar o conteúdo com a Bíblia e com líderes espirituais de confiança.
                  </p>
                </div>
              </details>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <details className="group">
                <summary className="flex justify-between items-center p-4 cursor-pointer">
                  <h3 className="font-medium text-lg">O Bible Chat apresenta diferentes perspectivas teológicas?</h3>
                  <span className="transition-transform duration-200 group-open:rotate-180">
                    <ArrowDown className="h-5 w-5" />
                  </span>
                </summary>
                <div className="p-4 pt-0 border-t">
                  <p className="text-gray-600">
                    Sim. O Bible Chat reconhece a diversidade de tradições teológicas dentro do cristianismo histórico e pode apresentar diferentes perspectivas sobre determinados temas, sempre indicando quando uma interpretação é específica de uma tradição particular.
                  </p>
                </div>
              </details>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <details className="group">
                <summary className="flex justify-between items-center p-4 cursor-pointer">
                  <h3 className="font-medium text-lg">Posso usar o Bible Chat para preparar sermões e aulas?</h3>
                  <span className="transition-transform duration-200 group-open:rotate-180">
                    <ArrowDown className="h-5 w-5" />
                  </span>
                </summary>
                <div className="p-4 pt-0 border-t">
                  <p className="text-gray-600">
                    Absolutamente! O Bible Chat foi desenvolvido especialmente para auxiliar líderes, pastores e professores na preparação de conteúdo ministerial. Com os templates específicos, você pode criar esboços de sermões, planos de aula e estudos bíblicos de maneira eficiente.
                  </p>
                </div>
              </details>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <details className="group">
                <summary className="flex justify-between items-center p-4 cursor-pointer">
                  <h3 className="font-medium text-lg">Minhas conversas são privadas?</h3>
                  <span className="transition-transform duration-200 group-open:rotate-180">
                    <ArrowDown className="h-5 w-5" />
                  </span>
                </summary>
                <div className="p-4 pt-0 border-t">
                  <p className="text-gray-600">
                    Sim, suas conversas são confidenciais e armazenadas de forma segura. Apenas você tem acesso ao seu histórico de conversas, e estamos comprometidos em proteger sua privacidade em todos os momentos.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Planos e Preços */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos e Preços</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Escolha o plano ideal para suas necessidades
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="animate-on-scroll">
              <Card className="border-2 border-gray-200 h-full">
                <CardHeader>
                  <CardTitle className="text-2xl">Plano Gratuito</CardTitle>
                  <CardDescription className="text-lg">Acesso básico à plataforma</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">R$ 0</span>
                    <span className="text-gray-500">/mês</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Acesso aos livros da Bíblia</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>10 mensagens por dia</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Histórico de conversas (7 dias)</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleGetStarted} 
                    className="w-full bg-chatgpt-accent hover:bg-chatgpt-accent/90 text-white"
                  >
                    Começar Gratuitamente
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="animate-on-scroll">
              <Card className="border-2 border-chatgpt-accent h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-chatgpt-accent text-white px-3 py-1 text-sm font-medium">
                  Recomendado
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">Plano Premium</CardTitle>
                  <CardDescription className="text-lg">Acesso completo à plataforma</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">R$ 19,90</span>
                    <span className="text-gray-500">/mês</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Acesso a todos os livros da Bíblia</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Mensagens ilimitadas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Histórico completo de conversas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Exportação de conversas (PDF, DOCX, MD)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Templates ministeriais avançados</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Suporte prioritário</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleGetStarted} 
                    className="w-full bg-chatgpt-accent hover:bg-chatgpt-accent/90 text-white"
                  >
                    Assinar Agora
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
          
          <div className="text-center mt-8 text-sm text-gray-500 animate-on-scroll">
            <p>Pagamento seguro via cartão de crédito. Cancele a qualquer momento.</p>
          </div>
        </div>
      </section>

      {/* 11. Testemunhos em Vídeo */}
      <section className="py-20 px-4 md:px-8 bg-chatgpt-secondary">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Transformando Vidas</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Veja como o Bible Chat tem impactado a vida de pastores e líderes
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="animate-on-scroll">
              <div className="aspect-video bg-black rounded-xl overflow-hidden relative shadow-lg mb-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-chatgpt-accent/90 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </div>
                </div>
                <img 
                  src="/lovable-uploads/5dc8a9a6-6f14-4883-b9e9-30341e4efc9c.png" 
                  alt="Testemunho de Pastor" 
                  className="w-full h-full object-cover opacity-70"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pr. Roberto Almeida</h3>
              <p className="text-gray-600">
                "O Bible Chat me ajudou a preparar sermões mais profundos com insights que eu não havia considerado antes."
              </p>
            </div>
            
            <div className="animate-on-scroll">
              <div className="aspect-video bg-black rounded-xl overflow-hidden relative shadow-lg mb-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-chatgpt-accent/90 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </div>
                </div>
                <img 
                  src="/lovable-uploads/b7516a63-b1e6-46bc-93c9-927bf0c2accf.png" 
                  alt="Testemunho de Líder" 
                  className="w-full h-full object-cover opacity-70"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Profa. Marina Santos</h3>
              <p className="text-gray-600">
                "Meus alunos de escola dominical estão mais engajados com as histórias bíblicas graças ao material que crio com o Bible Chat."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 12. Chamada à Ação Final */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-chatgpt-accent to-blue-700 text-white">
        <div className="container mx-auto max-w-5xl animate-on-scroll">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pronto para Transformar seu Estudo Bíblico?</h2>
            <p className="text-xl max-w-3xl mx-auto mb-10 text-white/90">
              Junte-se a milhares de cristãos que estão aprofundando seu conhecimento bíblico com o Bible Chat
            </p>
            
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Button 
                onClick={handleGetStarted}
                size="lg" 
                className="bg-white text-chatgpt-accent hover:bg-white/90 font-medium px-8"
              >
                Começar Gratuitamente
              </Button>
              <Button 
                onClick={() => scrollToSection(featuresRef)}
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Ver Recursos
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold">66</p>
              <p className="text-white/80">Livros da Bíblia</p>
            </div>
            <div>
              <p className="text-3xl font-bold">1000+</p>
              <p className="text-white/80">Usuários Ativos</p>
            </div>
            <div>
              <p className="text-3xl font-bold">50+</p>
              <p className="text-white/80">Templates</p>
            </div>
            <div>
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-white/80">Disponibilidade</p>
            </div>
          </div>
        </div>
      </section>

      {/* 13. Footer */}
      <footer className="bg-chatgpt-main py-12 px-4 md:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Bible Chat</h3>
              <p className="text-gray-600 mb-4">
                Transformando o estudo bíblico através da inteligência artificial.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-chatgpt-accent">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-chatgpt-accent">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-chatgpt-accent">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Produto</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-chatgpt-accent">Recursos</a></li>
                <li><a href="#" className="text-gray-600 hover:text-chatgpt-accent">Preços</a></li>
                <li><a href="#" className="text-gray-600 hover:text-chatgpt-accent">FAQ</a></li>
                <li><a href="#" className="text-gray-600 hover:text-chatgpt-accent">Testemunhos</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Livros</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-chatgpt-accent">Antigo Testamento</a></li>
                <li><a href="#" className="text-gray-600 hover:text-chatgpt-accent">Novo Testamento</a></li>
                <li><a href="#" className="text-gray-600 hover:text-chatgpt-accent">Evangelhos</a></li>
                <li><a href="#" className="text-gray-600 hover:text-chatgpt-accent">Cartas de Paulo</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Suporte</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-chatgpt-accent">Centro de Ajuda</a></li>
                <li><a href="#" className="text-gray-600 hover:text-chatgpt-accent">Contato</a></li>
                <li><a href="#" className="text-gray-600 hover:text-chatgpt-accent">Política de Privacidade</a></li>
                <li><a href="#" className="text-gray-600 hover:text-chatgpt-accent">Termos de Uso</a></li>
              </ul>
            </div>
          </div>
          
          <Separator />
          
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 mb-4 md:mb-0">© 2025 Bible Chat. Todos os direitos reservados.</p>
            <p className="text-gray-500">
              "Porque a palavra de Deus é viva e eficaz..." - Hebreus 4:12
            </p>
          </div>
        </div>
      </footer>
      
      {/* Adiciona keyframes para a animação fade-in */}
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-on-scroll {
          opacity: 0;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        `}
      </style>
    </div>
  );
};

export default LandingPage;

