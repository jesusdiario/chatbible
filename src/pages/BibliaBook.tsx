
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBook, useVersesByBook } from '@/hooks/useBiblia1Data';
import Biblia1BottomNav from '@/components/biblia1/Biblia1BottomNav';
import { Loader2, ChevronLeft, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

const BibliaBook: React.FC = () => {
  const { bookId, chapter } = useParams<{ bookId: string; chapter?: string }>();
  const navigate = useNavigate();
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const { book, isLoading: isLoadingBook, error: bookError } = useBook(Number(bookId));
  const { verses, isLoading: isLoadingVerses, error: versesError } = useVersesByBook(Number(bookId));
  
  const isLoading = isLoadingBook || isLoadingVerses;
  const error = bookError || versesError;
  
  // Detectar rolagem para mostrar/esconder botão de voltar ao topo
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Função para rolar até o topo da página
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="mt-4">Carregando...</span>
      </div>
    );
  }
  
  if (error || !book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500">
        <p>Erro ao carregar o livro</p>
        <p className="text-sm mt-2">{(error as Error)?.message || 'Livro não encontrado'}</p>
        <Link to="/biblia" className="mt-4 text-blue-500 flex items-center">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar para Bíblia
        </Link>
      </div>
    );
  }
  
  // Agrupar versos por capítulo
  const versesByChapter: Record<number, Array<{ verse: number, text: string }>> = {};
  
  verses?.forEach(verse => {
    if (verse.chapter) {
      if (!versesByChapter[verse.chapter]) {
        versesByChapter[verse.chapter] = [];
      }
      versesByChapter[verse.chapter].push({ 
        verse: verse.verse || 0, 
        text: verse.text || '' 
      });
    }
  });
  
  // Obter lista de capítulos disponíveis
  const availableChapters = Object.keys(versesByChapter).map(Number).sort((a, b) => a - b);
  
  // Se temos um capítulo específico na URL, mostrar apenas esse capítulo
  const selectedChapter = chapter ? parseInt(chapter) : undefined;
  
  return (
    <div className="pb-20 max-w-4xl mx-auto px-4">
      <header className="py-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/biblia">Bíblia</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {selectedChapter ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink as={Link} to={`/biblia/${bookId}`}>{book.name}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Capítulo {selectedChapter}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage>{book.name}</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      
      <main>
        {!selectedChapter ? (
          // Mostrar grid de capítulos quando não houver capítulo selecionado
          <div>
            <h1 className="text-2xl font-bold mb-6">{book.name}</h1>
            <h2 className="text-lg font-medium mb-4">Selecione um capítulo:</h2>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mb-8">
              {availableChapters.map(chapterNum => (
                <Button
                  key={chapterNum}
                  variant="outline"
                  onClick={() => navigate(`/biblia/${bookId}/${chapterNum}`)}
                  className="h-12 w-full"
                >
                  {chapterNum}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          // Mostrar versos do capítulo selecionado
          <div>
            <h2 className="text-xl font-semibold mb-4">{book.name} - Capítulo {selectedChapter}</h2>
            <div className="space-y-2">
              {versesByChapter[selectedChapter]?.map(verse => (
                <p key={verse.verse} className="text-gray-800">
                  <span className="text-xs align-super font-bold text-gray-500 mr-1">{verse.verse}</span>
                  {verse.text}
                </p>
              ))}
            </div>
          </div>
        )}
        
        {selectedChapter && availableChapters.length > 0 && (
          <div className="flex justify-between mt-10 mb-4">
            {selectedChapter > Math.min(...availableChapters) && (
              <Button 
                variant="outline"
                onClick={() => navigate(`/biblia/${bookId}/${selectedChapter - 1}`)}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Capítulo anterior
              </Button>
            )}
            {selectedChapter < Math.max(...availableChapters) && (
              <Button 
                variant="outline"
                onClick={() => navigate(`/biblia/${bookId}/${selectedChapter + 1}`)}
                className="flex items-center ml-auto"
              >
                Próximo capítulo <ChevronLeft className="h-4 w-4 ml-1 rotate-180" />
              </Button>
            )}
          </div>
        )}
        
        {Object.keys(versesByChapter).length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <p>Não há versículos disponíveis para este livro.</p>
          </div>
        )}
      </main>
      
      {showScrollToTop && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-20 right-4 rounded-full shadow-md"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
      
      <Biblia1BottomNav />
    </div>
  );
};

export default BibliaBook;
