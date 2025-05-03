
import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBook, useVersesByBook, useFavorites } from '@/hooks/useBiblia1Data';
import Biblia1BottomNav from '@/components/biblia1/Biblia1BottomNav';
import Biblia1Favorites from '@/components/biblia1/Biblia1Favorites';
import { 
  Loader2, 
  ChevronLeft, 
  Grid, 
  BookOpen, 
  Star, 
  Share, 
  Copy,
  BookmarkCheck 
} from 'lucide-react';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

// ... resto do código permanece o mesmo (funções de gerenciamento, efeitos, etc.) ...

const BibliaBook: React.FC = () => {
  const { bookId, chapter } = useParams<{ bookId: string; chapter?: string }>();
  const navigate = useNavigate();
  const { book, isLoading: isLoadingBook, error: bookError } = useBook(Number(bookId));
  const { verses, isLoading: isLoadingVerses, error: versesError } = useVersesByBook(Number(bookId));
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();
  
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [isTextDialogOpen, setIsTextDialogOpen] = useState(false);
  
  const versesRef = useRef<{ [key: number]: HTMLParagraphElement | null }>({});
  
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
  
  // Monitora seleção de texto
  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        setSelectedText(selection.toString());
        
        // Tenta descobrir qual versículo foi selecionado
        let closestVerse = null;
        let node = selection.anchorNode;
        while (node && node !== document.body) {
          const verseElement = node.parentElement?.closest('[data-verse]');
          if (verseElement) {
            closestVerse = parseInt(verseElement.getAttribute('data-verse') || '0');
            break;
          }
          node = node.parentElement;
        }
        
        setSelectedVerse(closestVerse);
        if (selection.toString().trim().length > 10) {
          setIsTextDialogOpen(true);
        }
      }
    };

    document.addEventListener('mouseup', handleTextSelection);
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, []);
  
  // Rola para o versículo quando vindo de uma busca ou link direto
  useEffect(() => {
    if (chapter && window.location.hash) {
      const verseNumber = parseInt(window.location.hash.replace('#v', ''));
      if (!isNaN(verseNumber) && versesRef.current[verseNumber]) {
        setTimeout(() => {
          versesRef.current[verseNumber]?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          });
        }, 500);
      }
    }
  }, [chapter, chapterVerses]);
  
  const handleCopyText = () => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText);
      toast({
        title: "Texto copiado",
        description: "O texto selecionado foi copiado para a área de transferência"
      });
      setIsTextDialogOpen(false);
    }
  };
  
  const handleShareText = () => {
    if (selectedText && book && chapter) {
      const shareText = `"${selectedText}" - ${book.name} ${chapter}${selectedVerse ? `:${selectedVerse}` : ''}`;
      
      if (navigator.share) {
        navigator.share({
          text: shareText,
          title: "Compartilhar versículo"
        }).catch((error) => console.error('Erro ao compartilhar:', error));
      } else {
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Texto copiado",
          description: "O texto foi copiado para área de transferência para compartilhamento"
        });
      }
      setIsTextDialogOpen(false);
    }
  };
  
  const handleFavoriteVerse = () => {
    if (book && chapter && selectedVerse) {
      const verseToFavorite = chapterVerses.find(v => v.verse === selectedVerse);
      
      if (verseToFavorite) {
        const favoriteItem = {
          id: `${book.id}-${chapter}-${selectedVerse}`,
          bookId: book.id,
          bookName: book.name,
          bookAbbrev: book.abbrev,
          chapter: Number(chapter),
          verse: selectedVerse,
          text: verseToFavorite.text || '',
          createdAt: new Date().toISOString()
        };
        
        if (isFavorite(book.id, Number(chapter), selectedVerse)) {
          removeFavorite(favoriteItem);
        } else {
          addFavorite(favoriteItem);
        }
      }
      
      setIsTextDialogOpen(false);
    }
  };
  
  const handleFavoriteChapter = () => {
    if (book && chapter) {
      const favoriteItem = {
        id: `${book.id}-${chapter}`,
        bookId: book.id,
        bookName: book.name,
        bookAbbrev: book.abbrev,
        chapter: Number(chapter),
        createdAt: new Date().toISOString()
      };
      
      if (isFavorite(book.id, Number(chapter))) {
        removeFavorite(favoriteItem);
      } else {
        addFavorite(favoriteItem);
      }
    }
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

  // If no chapter is selected, show chapter grid
  if (!chapter) {
    return (
      <div className="pb-20 max-w-4xl mx-auto px-4">
        <header className="py-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/biblia">Bíblia</Link>
                </BreadcrumbLink>
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
        
        <Biblia1Favorites 
          favorites={favorites} 
          removeFavorite={removeFavorite} 
        />
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
              <BreadcrumbLink asChild>
                <Link to="/biblia">Bíblia</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/biblia/${bookId}`}>{book.name}</Link>
              </BreadcrumbLink>
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
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteChapter}
              aria-label={isFavorite(book.id, Number(chapter)) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Star 
                className={`h-5 w-5 ${isFavorite(book.id, Number(chapter)) ? 'fill-yellow-400 text-yellow-400' : ''}`} 
              />
            </Button>
            
            <Button 
              onClick={() => {
                const currentIndex = availableChapters.indexOf(Number(chapter));
                if (currentIndex > 0) {
                  navigate(`/biblia/${bookId}/${availableChapters[currentIndex - 1]}`);
                }
              }}
              disabled={availableChapters.indexOf(Number(chapter)) === 0}
              variant="ghost"
              size="icon"
              className="disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Capítulo anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Link to={`/biblia/${bookId}`} className="rounded-full hover:bg-gray-100">
              <Button variant="ghost" size="icon" aria-label="Ver todos os capítulos">
                <Grid className="h-5 w-5" />
              </Button>
            </Link>
            
            <Button 
              onClick={() => {
                const currentIndex = availableChapters.indexOf(Number(chapter));
                if (currentIndex < availableChapters.length - 1) {
                  navigate(`/biblia/${bookId}/${availableChapters[currentIndex + 1]}`);
                }
              }}
              disabled={availableChapters.indexOf(Number(chapter)) === availableChapters.length - 1}
              variant="ghost"
              size="icon"
              className="disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Próximo capítulo"
            >
              <ChevronLeft className="h-5 w-5 transform rotate-180" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="mt-4 pb-6">
        <ScrollArea className="h-[calc(100vh-250px)]">
          {chapterVerses.length > 0 ? (
            <div className="prose max-w-none">
              {chapterVerses.map(verse => (
                <p 
                  key={verse.verse} 
                  ref={el => verse.verse && (versesRef.current[verse.verse] = el)}
                  id={`v${verse.verse}`}
                  data-verse={verse.verse}
                  className="mb-4 leading-relaxed relative group"
                >
                  <span className="text-xs align-super font-bold text-gray-500 mr-1">
                    {verse.verse}
                  </span>
                  {verse.text}
                  
                  {verse.verse && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        if (verse.verse) {
                          const favoriteItem = {
                            id: `${book.id}-${chapter}-${verse.verse}`,
                            bookId: book.id,
                            bookName: book.name,
                            bookAbbrev: book.abbrev,
                            chapter: Number(chapter),
                            verse: verse.verse,
                            text: verse.text || '',
                            createdAt: new Date().toISOString()
                          };
                          
                          if (isFavorite(book.id, Number(chapter), verse.verse)) {
                            removeFavorite(favoriteItem);
                          } else {
                            addFavorite(favoriteItem);
                          }
                        }
                      }}
                      aria-label={
                        verse.verse && isFavorite(book.id, Number(chapter), verse.verse)
                          ? "Remover dos favoritos"
                          : "Adicionar aos favoritos"
                      }
                    >
                      <Star 
                        className={`h-4 w-4 ${
                          verse.verse && isFavorite(book.id, Number(chapter), verse.verse) 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : ''
                        }`} 
                      />
                    </Button>
                  )}
                </p>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <BookOpen className="mx-auto h-12 w-12 opacity-30 mb-2" />
              <p>Não há versículos disponíveis para este capítulo.</p>
            </div>
          )}
        </ScrollArea>
      </main>
      
      <Dialog open={isTextDialogOpen} onOpenChange={setIsTextDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Texto Selecionado</DialogTitle>
            <DialogDescription>
              {book.name} {chapter}{selectedVerse ? `:${selectedVerse}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-gray-50 rounded-md my-2">
            {selectedText}
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleFavoriteVerse}
              disabled={!selectedVerse}
            >
              {selectedVerse && isFavorite(book.id, Number(chapter), selectedVerse) ? (
                <BookmarkCheck className="mr-2 h-4 w-4" />
              ) : (
                <Star className="mr-2 h-4 w-4" />
              )}
              {selectedVerse && isFavorite(book.id, Number(chapter), selectedVerse) ? 
                'Remover favorito' : 'Favoritar'}
            </Button>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCopyText}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar
              </Button>
              <Button
                type="button"
                onClick={handleShareText}
              >
                <Share className="mr-2 h-4 w-4" />
                Compartilhar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Biblia1Favorites 
        favorites={favorites} 
        removeFavorite={removeFavorite} 
      />
      <Biblia1BottomNav />
    </div>
  );
};

export default BibliaBook;
