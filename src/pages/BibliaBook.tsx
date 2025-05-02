
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBook, useVersesByBook } from '@/hooks/useBiblia1Data';
import Biblia1BottomNav from '@/components/biblia1/Biblia1BottomNav';
import { Loader2, ChevronLeft, Grid, BookOpen } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const BibliaBook: React.FC = () => {
  const { bookId, chapter } = useParams<{ bookId: string; chapter?: string }>();
  const navigate = useNavigate();
  const { book, isLoading: isLoadingBook, error: bookError } = useBook(Number(bookId));
  const { verses, isLoading: isLoadingVerses, error: versesError } = useVersesByBook(Number(bookId));
  
  const isLoading = isLoadingBook || isLoadingVerses;
  const error = bookError || versesError;

  // Get available chapters from verses
  const availableChapters = React.useMemo(() => {
    if (!verses) return [];
    const chapters = new Set<number>();
    verses.forEach(verse => {
      if (verse.chapter) {
        chapters.add(verse.chapter);
      }
    });
    return Array.from(chapters).sort((a, b) => a - b);
  }, [verses]);
  
  // Filter verses by chapter
  const chapterVerses = React.useMemo(() => {
    if (!verses || !chapter) return [];
    return verses
      .filter(verse => verse.chapter === Number(chapter))
      .sort((a, b) => (a.verse || 0) - (b.verse || 0));
  }, [verses, chapter]);
  
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

  // If no chapter is selected, show chapter grid
  if (!chapter) {
    return (
      <div className="pb-20 max-w-4xl mx-auto px-4">
        <header className="py-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink as={Link} to="/biblia">Bíblia</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{book.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="flex items-center mt-2">
            <Link to="/biblia" className="mr-4">
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">{book.name}</h1>
          </div>
          <p className="text-gray-600 mt-2">Selecione um capítulo</p>
        </header>
        
        <div className="grid grid-cols-5 sm:grid-cols-8 gap-4 mt-4">
          {availableChapters.map(chapterNum => (
            <Link 
              key={chapterNum} 
              to={`/biblia/${bookId}/${chapterNum}`}
              className="aspect-square bg-blue-50 rounded-lg flex items-center justify-center hover:bg-blue-100 transition-colors"
            >
              <span className="text-lg font-medium">{chapterNum}</span>
            </Link>
          ))}
        </div>
        
        <Biblia1BottomNav />
      </div>
    );
  }
  
  // If chapter is selected, show verses
  return (
    <div className="pb-20 max-w-4xl mx-auto px-4">
      <header className="py-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/biblia">Bíblia</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to={`/biblia/${bookId}`}>{book.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Capítulo {chapter}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <Link to={`/biblia/${bookId}`} className="mr-4">
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-xl font-bold">{book.name} - Capítulo {chapter}</h1>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => {
                const currentIndex = availableChapters.indexOf(Number(chapter));
                if (currentIndex > 0) {
                  navigate(`/biblia/${bookId}/${availableChapters[currentIndex - 1]}`);
                }
              }}
              disabled={availableChapters.indexOf(Number(chapter)) === 0}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Capítulo anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <Link to={`/biblia/${bookId}`} className="p-2 rounded-full hover:bg-gray-100">
              <Grid className="h-5 w-5" />
            </Link>
            
            <button 
              onClick={() => {
                const currentIndex = availableChapters.indexOf(Number(chapter));
                if (currentIndex < availableChapters.length - 1) {
                  navigate(`/biblia/${bookId}/${availableChapters[currentIndex + 1]}`);
                }
              }}
              disabled={availableChapters.indexOf(Number(chapter)) === availableChapters.length - 1}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Próximo capítulo"
            >
              <ChevronLeft className="h-5 w-5 transform rotate-180" />
            </button>
          </div>
        </div>
      </header>
      
      <main className="mt-4 pb-6">
        {chapterVerses.length > 0 ? (
          <div className="prose max-w-none">
            {chapterVerses.map(verse => (
              <p key={verse.verse} className="mb-4 leading-relaxed">
                <span className="text-xs align-super font-bold text-gray-500 mr-1">{verse.verse}</span>
                {verse.text}
              </p>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            <BookOpen className="mx-auto h-12 w-12 opacity-30 mb-2" />
            <p>Não há versículos disponíveis para este capítulo.</p>
          </div>
        )}
      </main>
      
      <Biblia1BottomNav />
    </div>
  );
};

export default BibliaBook;
