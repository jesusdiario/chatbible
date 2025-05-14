
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  MessageSquare, 
  Star, 
  Search, 
  Users, 
  BookOpen as BookIcon, 
  BookOpen as BookOpenIcon, 
  MessageSquare as MessageIcon, 
  File as FileIcon, 
  ArrowRight, 
  Search as SearchIcon, 
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="flex flex-col min-h-screen bg-[#131415] text-white">
      {/* Header/Navigation */}
      <header className={cn(
        "fixed w-full z-50 transition-all duration-200", 
        scrolled ? "bg-[#131415]/90 backdrop-blur-sm border-b border-white/5" : ""
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-600 rounded-md flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">Discipler</span>
              </Link>
              
              <nav className="hidden md:flex ml-10 space-x-8">
                <Link to="/biblia-online" className="text-sm text-white/70 hover:text-white transition">Bíblia Online</Link>
                <div className="relative group">
                  <button className="text-sm text-white/70 hover:text-white inline-flex items-center transition">
                    Conversar com a Palavra
                    <ChevronRight className="ml-1 w-3 h-3 transform group-hover:rotate-90 transition-transform" />
                  </button>
                  <div className="absolute left-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                    <div className="py-2 bg-[#1c1d1f] rounded-md shadow-xl border border-white/5">
                      <Link to="/livros-da-biblia" className="block px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5">Livros da Bíblia</Link>
                      <Link to="/temas-da-biblia" className="block px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5">Temas Bíblicos</Link>
                      <Link to="/teologia-crista" className="block px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5">Temas de Teologia</Link>
                    </div>
                  </div>
                </div>
                <Link to="/guias-de-estudo" className="text-sm text-white/70 hover:text-white transition">Guias de Estudo</Link>
                <Link to="/comunidade" className="text-sm text-white/70 hover:text-white transition">Comunidade</Link>
                <Link to="/blog" className="text-sm text-white/70 hover:text-white transition">Blog</Link>
                <Link to="/precos" className="text-sm text-white/70 hover:text-white transition">Preços</Link>
              </nav>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">Login</Button>
              </Link>
              <Link to="/auth?signup=true">
                <Button className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white border-0">
                  Comece a Estudar
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button onClick={toggleMenu} className="p-2 text-white focus:outline-none">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#1c1d1f] border-t border-white/5">
            <div className="px-4 pt-2 pb-4 space-y-1">
              <Link to="/biblia-online" className="block px-3 py-2 text-base font-medium text-white hover:bg-white/5 rounded-md">Bíblia Online</Link>
              <div className="px-3 py-2">
                <div className="font-medium text-white">Conversar com a Palavra</div>
                <div className="pl-3 mt-2 space-y-1">
                  <Link to="/livros-da-biblia" className="block px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-md">Livros da Bíblia</Link>
                  <Link to="/temas-da-biblia" className="block px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-md">Temas Bíblicos</Link>
                  <Link to="/teologia-crista" className="block px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-md">Temas de Teologia</Link>
                </div>
              </div>
              <Link to="/guias-de-estudo" className="block px-3 py-2 text-base font-medium text-white hover:bg-white/5 rounded-md">Guias de Estudo</Link>
              <Link to="/comunidade" className="block px-3 py-2 text-base font-medium text-white hover:bg-white/5 rounded-md">Comunidade</Link>
              <Link to="/blog" className="block px-3 py-2 text-base font-medium text-white hover:bg-white/5 rounded-md">Blog</Link>
              <Link to="/precos" className="block px-3 py-2 text-base font-medium text-white hover:bg-white/5 rounded-md">Preços</Link>
              <div className="pt-4 space-y-2">
                <Link to="/auth" className="block w-full px-4 py-2 text-center text-white border border-white/20 rounded-md hover:bg-white/5">Login</Link>
                <Link to="/auth?signup=true" className="block w-full px-4 py-2 text-center text-white bg-gradient-to-r from-emerald-500 to-blue-600 rounded-md hover:from-emerald-600 hover:to-blue-700">Comece a Estudar</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold leading-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-6">
              Desvende a Profundidade da Palavra, Transforme sua Jornada
            </h1>
            <p className="text-lg sm:text-xl text-white/70 mb-10 max-w-3xl mx-auto">
              Sua plataforma completa para estudo bíblico aprofundado, com ferramentas de análise, conversas guiadas com as Escrituras e recursos teológicos interativos.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link to="/biblia-online">
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white border-0 w-full sm:w-auto">
                  Explorar a Bíblia Online
                </Button>
              </Link>
              <Link to="/livros-da-biblia">
                <Button size="lg" variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white w-full sm:w-auto">
                  Converse com a Palavra
                </Button>
              </Link>
            </div>
            
            <div className="relative mt-16 max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-600/20 blur-2xl rounded-xl"></div>
              <div className="relative bg-[#1c1d1f] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-blue-600"></div>
                <div className="flex items-center p-3 bg-[#18191b] border-b border-white/5">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-6">
                  <img 
                    src="https://via.placeholder.com/800x400/1c1d1f/5f5f5f?text=Demonstração+Discipler" 
                    alt="Demonstração da plataforma Discipler" 
                    className="w-full rounded shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recommended by Section */}
        <section className="py-12 bg-[#18191b]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-sm font-medium text-white/50 mb-6 uppercase tracking-wider">
              Recomendado Por
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-center">
                  <div className="h-6 text-white/30">
                    <span className="font-bold text-lg">LOGO {i+1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-bold mb-4">Ferramentas Avançadas para Seu Estudo Bíblico</h2>
              <p className="text-lg text-white/70 max-w-3xl mx-auto">
                Explore recursos poderosos que vão transformar a maneira como você estuda e compreende as Escrituras Sagradas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Feature Card 1 */}
              <div className="bg-[#1c1d1f] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all group">
                <div className="p-8">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-600/20 flex items-center justify-center mb-6">
                    <BookOpenIcon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Explore a Bíblia Versículo a Versículo</h3>
                  <p className="text-white/70 mb-6">
                    Acesse múltiplas traduções, selecione textos e utilize ferramentas poderosas de estudo com um clique: Versículo Fácil, Linguagem Infantil, Evangelizar, Contexto Familiar, e muito mais.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-white/70">
                      <svg className="w-5 h-5 mr-2 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Análise Detalhada
                    </li>
                    <li className="flex items-center text-sm text-white/70">
                      <svg className="w-5 h-5 mr-2 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Múltiplas Ferramentas
                    </li>
                    <li className="flex items-center text-sm text-white/70">
                      <svg className="w-5 h-5 mr-2 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Interface Intuitiva
                    </li>
                  </ul>
                  <Link to="/biblia-online" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 font-medium">
                    Explorar Ferramenta
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
                <div className="px-8 py-6 bg-[#18191b] border-t border-white/5">
                  <div className="aspect-w-16 aspect-h-9 bg-[#212225] rounded overflow-hidden">
                    <div className="flex items-center justify-center h-full p-4">
                      <img src="https://via.placeholder.com/500x280/212225/5f5f5f?text=Demo+Bíblia+Online" alt="Demo Bíblia Online" className="rounded" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="bg-[#1c1d1f] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all group">
                <div className="p-8">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-600/20 flex items-center justify-center mb-6">
                    <MessageIcon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Diálogos Iluminadores com Cada Livro</h3>
                  <p className="text-white/70 mb-6">
                    Faça perguntas diretamente aos livros da Bíblia, receba respostas contextuais e aprofunde sua compreensão com guias de estudo integrados.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-white/70">
                      <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Respostas Contextualizadas
                    </li>
                    <li className="flex items-center text-sm text-white/70">
                      <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Guias de Estudo
                    </li>
                    <li className="flex items-center text-sm text-white/70">
                      <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Compreensão Facilitada
                    </li>
                  </ul>
                  <Link to="/livros-da-biblia" className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium">
                    Conversar Agora
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
                <div className="px-8 py-6 bg-[#18191b] border-t border-white/5">
                  <div className="bg-[#212225] rounded overflow-hidden">
                    <div className="flex flex-col gap-4 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold">EU</span>
                        </div>
                        <div className="bg-[#2a2b2f] px-4 py-2 rounded-lg text-sm">
                          O que o livro de Romanos ensina sobre a justificação pela fé?
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <BookIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-[#2a2b2f]/50 px-4 py-2 rounded-lg text-sm">
                          Em Romanos, Paulo desenvolve sistematicamente a doutrina da justificação pela fé, especialmente nos capítulos 3 a 5. A justificação é apresentada como um ato jurídico divino onde Deus declara o pecador como justo com base na fé em Cristo e não nas obras da lei...
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Card 3 */}
              <div className="bg-[#1c1d1f] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all group">
                <div className="p-8">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-600/20 flex items-center justify-center mb-6">
                    <SearchIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Navegue por Temas Centrais da Fé</h3>
                  <p className="text-white/70 mb-6">
                    Investigue temas bíblicos cruciais, faça perguntas específicas e conecte passagens relacionadas com o auxílio de guias de estudo temáticos.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-white/70">
                      <svg className="w-5 h-5 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Estudo Temático Guiado
                    </li>
                    <li className="flex items-center text-sm text-white/70">
                      <svg className="w-5 h-5 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Conexões Relevantes
                    </li>
                    <li className="flex items-center text-sm text-white/70">
                      <svg className="w-5 h-5 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Aprofundamento Significativo
                    </li>
                  </ul>
                  <Link to="/temas-da-biblia" className="inline-flex items-center text-purple-400 hover:text-purple-300 font-medium">
                    Explorar Temas
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
                <div className="px-8 py-6 bg-[#18191b] border-t border-white/5">
                  <div className="bg-[#212225] rounded overflow-hidden">
                    <div className="flex flex-col gap-4 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold">EU</span>
                        </div>
                        <div className="bg-[#2a2b2f] px-4 py-2 rounded-lg text-sm">
                          O que a Bíblia ensina sobre a graça de Deus?
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <SearchIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-[#2a2b2f]/50 px-4 py-2 rounded-lg text-sm">
                          A graça de Deus é um tema central que percorre toda a Bíblia. É o favor imerecido de Deus, Seu dom gratuito para a humanidade. Em Efésios 2:8-9, lemos que "pela graça sois salvos, por meio da fé, e isto não vem de vós, é dom de Deus; não vem das obras, para que ninguém se glorie"...
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Card 4 */}
              <div className="bg-[#1c1d1f] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all group">
                <div className="p-8">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-600/20 flex items-center justify-center mb-6">
                    <FileIcon className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Fundamentos Teológicos ao Seu Alcance</h3>
                  <p className="text-white/70 mb-6">
                    Converse sobre doutrinas e conceitos teológicos, explore diferentes perspectivas e fortaleça sua base de conhecimento com guias de estudo especializados.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-white/70">
                      <svg className="w-5 h-5 mr-2 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Exploração Teológica
                    </li>
                    <li className="flex items-center text-sm text-white/70">
                      <svg className="w-5 h-5 mr-2 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Diversas Perspectivas
                    </li>
                    <li className="flex items-center text-sm text-white/70">
                      <svg className="w-5 h-5 mr-2 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Guias Especializados
                    </li>
                  </ul>
                  <Link to="/teologia-crista" className="inline-flex items-center text-amber-400 hover:text-amber-300 font-medium">
                    Explorar Teologia
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
                <div className="px-8 py-6 bg-[#18191b] border-t border-white/5">
                  <div className="bg-[#212225] rounded overflow-hidden">
                    <div className="flex flex-col gap-4 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold">EU</span>
                        </div>
                        <div className="bg-[#2a2b2f] px-4 py-2 rounded-lg text-sm">
                          Explique a soberania de Deus e o livre arbítrio humano.
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center flex-shrink-0">
                          <FileIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-[#2a2b2f]/50 px-4 py-2 rounded-lg text-sm">
                          A relação entre a soberania divina e o livre arbítrio humano é uma das questões teológicas mais profundas. Diferentes tradições cristãs abordam este tema de formas distintas. Algumas enfatizam mais a soberania de Deus (perspectiva calvinista), enquanto outras dão maior ênfase à liberdade humana (perspectiva arminiana)...
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Study Anywhere Section */}
        <section className="py-20 bg-[#18191b]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-bold mb-4">Sua Jornada Bíblica, Onde Você Estiver</h2>
              <p className="text-lg text-white/70 max-w-3xl mx-auto">
                Discipler adapta-se perfeitamente a qualquer dispositivo, levando profundidade bíblica aonde você for.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
              <div className="text-center">
                <div className="mb-6 p-6 bg-[#1c1d1f] rounded-xl border border-white/5 inline-flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1">Desktop</h3>
                <p className="text-sm text-white/50">Estudo profundo e detalhado</p>
              </div>
              <div className="text-center">
                <div className="mb-6 p-6 bg-[#1c1d1f] rounded-xl border border-white/5 inline-flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1">Tablet</h3>
                <p className="text-sm text-white/50">Ideal para leituras extensas</p>
              </div>
              <div className="text-center">
                <div className="mb-6 p-6 bg-[#1c1d1f] rounded-xl border border-white/5 inline-flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1">Mobile</h3>
                <p className="text-sm text-white/50">Consultas rápidas em qualquer lugar</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-bold mb-4">Vidas Transformadas pela Palavra</h2>
              <p className="text-lg text-white/70 max-w-3xl mx-auto">
                Descubra como Discipler tem auxiliado pessoas em suas jornadas espirituais.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "Discipler revolucionou minha abordagem ao ensino bíblico. As ferramentas de análise me permitem preparar estudos profundos em uma fração do tempo que levava antes.",
                  name: "Pastor Carlos Rodrigues",
                  role: "Igreja Batista Central"
                },
                {
                  quote: "Como professora de escola dominical, encontrei no Discipler um aliado inestimável. A capacidade de adaptar textos bíblicos para a linguagem infantil é simplesmente fantástica.",
                  name: "Mariana Silva",
                  role: "Educadora Cristã"
                },
                {
                  quote: "As conversas com os livros da Bíblia me ajudaram a entender contextos históricos que eu nunca tinha compreendido antes. Minha leitura bíblica ganhou profundidade e sentido.",
                  name: "Ricardo Mendes",
                  role: "Estudante de Teologia"
                }
              ].map((testimonial, i) => (
                <div key={i} className="bg-[#1c1d1f] rounded-xl p-8 border border-white/5">
                  <svg width="45" height="36" className="mb-6 text-white/20" viewBox="0 0 45 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.5 0L0 13H9L9 36H31.5L31.5 13L22.5 13L36 0L13.5 0Z" fill="currentColor"/>
                  </svg>
                  <p className="text-white/80 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/30 to-blue-600/30 flex items-center justify-center text-lg font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">{testimonial.name}</h4>
                      <p className="text-sm text-white/50">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Link to="/comunidade">
                <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
                  Faça Parte da Comunidade Discipler
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Ready-Made Resources Section */}
        <section className="py-20 bg-[#18191b]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-bold mb-4">Recursos Prontos para Impulsionar Seu Estudo</h2>
              <p className="text-lg text-white/70 max-w-3xl mx-auto">
                Comece instantaneamente com nossos guias e planos preparados por teólogos e educadores experientes.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Guia de Estudo: A Vida de Cristo nos Evangelhos",
                  type: "guia",
                  color: "from-blue-500/20 to-purple-600/20",
                  textColor: "text-blue-400",
                  icon: BookOpenIcon
                },
                {
                  title: "Plano de Leitura: Os Salmos de Davi",
                  type: "plano",
                  color: "from-emerald-500/20 to-blue-600/20",
                  textColor: "text-emerald-400",
                  icon: FileIcon
                },
                {
                  title: "Tópico em Destaque: Entendendo as Parábolas de Jesus",
                  type: "tópico",
                  color: "from-amber-500/20 to-red-600/20",
                  textColor: "text-amber-400",
                  icon: SearchIcon
                }
              ].map((resource, i) => (
                <div key={i} className="bg-[#1c1d1f] rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-all group">
                  <div className="p-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${resource.textColor} bg-gradient-to-br ${resource.color}`}>
                      {resource.type}
                    </span>
                    <h3 className="text-lg font-medium mb-4">{resource.title}</h3>
                    <Link to="/guias-de-estudo" className={`inline-flex items-center ${resource.textColor} hover:underline font-medium`}>
                      <span className="mr-2">Acessar</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 flex flex-col md:flex-row gap-4 justify-center">
              <Link to="/guias-de-estudo">
                <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
                  Ver Todos os Guias
                </Button>
              </Link>
              <Link to="/planos-de-leitura">
                <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10">
                  Explorar Planos de Leitura
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Main Demo Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-bold mb-4">Mergulhe Fundo: Veja o Discipler em Ação</h2>
              <p className="text-lg text-white/70 max-w-3xl mx-auto">
                Experimente nossa ferramenta principal e veja como o estudo bíblico pode ser transformador.
              </p>
            </div>
            
            <div className="bg-[#1c1d1f] rounded-xl overflow-hidden border border-white/5">
              <div className="border-b border-white/5">
                <div className="flex overflow-x-auto">
                  {["Bíblia Online", "Versículo Fácil", "Exegese", "Léxico"].map((tab, i) => (
                    <button key={i} className={`px-6 py-4 text-sm font-medium ${i === 0 ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-white/50'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-8">
                <div className="aspect-w-16 aspect-h-9 bg-[#212225] rounded overflow-hidden">
                  <div className="flex items-center justify-center p-8">
                    <img src="https://via.placeholder.com/1200x675/212225/5f5f5f?text=Demo+Ferramenta+Bíblica+Interativa" alt="Demonstração da ferramente Discipler" className="rounded shadow-lg max-w-full max-h-full" />
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <Link to="/biblia-online">
                    <Button className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white">
                      Experimentar Agora
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-[#18191b] relative">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px]"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px]"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Transforme Sua Jornada Bíblica Hoje Mesmo
              </h2>
              <p className="text-lg md:text-xl text-white/70 mb-10 max-w-3xl mx-auto">
                Junte-se a milhares de pessoas que estão experimentando as Escrituras de forma profunda e transformadora.
              </p>
              <Link to="/auth?signup=true">
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white text-lg">
                  Comece Gratuitamente
                  <ArrowDown className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-[#131415] border-t border-white/5">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <Link to="/" className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-600 rounded-md flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">Discipler</span>
              </Link>
              <p className="text-sm text-white/50 mb-4">
                Sua plataforma completa para estudo bíblico aprofundado, com ferramentas de análise e recursos teológicos interativos.
              </p>
              <div className="flex space-x-4">
                {["twitter", "facebook", "instagram", "youtube"].map((social) => (
                  <a key={social} href={`#${social}`} className="text-white/40 hover:text-white transition">
                    <span className="sr-only">{social}</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" clipRule="evenodd" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Produto</h3>
              <ul className="space-y-3">
                {["Bíblia Online", "Conversar com Livros", "Conversar com Temas", "Teologia Interativa", "Guias de Estudo", "Ferramentas de Análise"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-white/50 hover:text-white transition">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Recursos</h3>
              <ul className="space-y-3">
                {["Blog", "FAQ", "Suporte Técnico", "Planos de Leitura", "Glossário Teológico"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-white/50 hover:text-white transition">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Empresa</h3>
              <ul className="space-y-3">
                {["Sobre Nós", "Nossa Missão", "Contato", "Termos de Serviço", "Política de Privacidade"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-white/50 hover:text-white transition">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-sm text-white/40 text-center">
              © {new Date().getFullYear()} Discipler. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
