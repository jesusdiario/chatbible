import React, { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useBook, useVersesByBookChapter, useBibleFavorites } from '@/hooks/useBiblia';
import BibliaBottomNav from '@/components/biblia/BibliaBottomNav';
import { VolumeIcon, ChevronLeft, Book as BookIcon, Bookmark, BookmarkPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import ChapterNavigation from '@/components/biblia/ChapterNavigation';
import ChapterSelector from '@/components/biblia/ChapterSelector';
import VerseItem from '@/components/biblia/VerseItem';
import VerseSelectionModal from '@/components/biblia/VerseSelectionModal';
import { Verse, BibleVersion } from '@/types/biblia';
import BibleVersionSelector from '@/components/biblia/BibleVersionSelector';

const BibliaBook: React.FC = () => {
  const { bookId, chapter } = useParams<{ bookId: string; chapter: string }>();
  const [searchParams] = useSearchParams();
  const highlightVerseStr = searchParams.get('highlight');
  
  // Estado para controlar a versão da Bíblia
  const [version, setVersion] = useState<BibleVersion>(() => {
    return (localStorage.getItem('bible-default-version') as BibleVersion) || 'acf';
  });
  
  // Referências para elementos DOM
  const versesContainerRef = useRef<HTMLDivElement>(null);
  const highlightedVerseRef = useRef<HTMLDivElement | null>(null);
  
  // Estado para seleção de versículos
  const [selectedVerses, setSelectedVerses] = useState<Verse[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Favoritos
  const { isFavorite, addFavorite, removeFavorite } = useBibleFavorites();
  
  // Consulta de dados
  const { data: book, isLoading: isLoadingBook, error: bookError } = useBook(bookId || '');
  const { 
    data: verses, 
    isLoading: isLoadingVerses, 
    error: versesError 
  } = useVersesByBookChapter(bookId || '', chapter || '1', version);
  
  const isLoading = isLoadingBook || isLoadingVerses;
  const error = bookError || versesError;

  // Converter highlight para número se necessário
  const highlightVerse = highlightVerseStr ? parseInt(highlightVerseStr, 10) : null;
  
  // Efeito para rolagem suave até o versículo destacado
  useEffect(() => {
    if (highlightVerse !== null && verses && verses.length > 0 && versesContainerRef.current) {
      // Encontrar o versículo a ser destacado
      const verseToHighlight = verses.find(v => v.verse === highlightVerse);
      
      if (verseToHighlight) {
        // Dar tempo para o DOM renderizar
        setTimeout(() => {
          if (highlightedVerseRef.current) {
            highlightedVerseRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }
        }, 500);
      }
    }
  }, [highlightVerse, verses]);
  
  // Manipulador para seleção de versículos
  const handleVerseSelect = (verse: Verse) => {
    // Verificar se já está selecionado
    const isSelected = selectedVerses.some(v => v.id === verse.id);
    
    if (isSelected) {
      // Se já está selecionado, remover da seleção
      setSelectedVerses(prev => prev.filter(v => v.id !== verse.id));
      
      // Se era o último versículo selecionado, fechar o modal
      if (selectedVerses.length === 1) {
        setShowModal(false);
      }
    } else {
      // Se não está selecionado, adicionar à seleção
      setSelectedVerses(prev => [...prev, verse]);
      
      // Se é o primeiro versículo selecionado, abrir o modal
      if (selectedVerses.length === 0) {
        setShowModal(true);
      }
    }
  };

  // Manipular toggle de favorito
  const handleToggleFavorite = (verse: Verse) => {
    if (isFavorite(verse)) {
      removeFavorite(verse);
    } else {
      addFavorite(verse);
    }
  };
  
  // Fechar o modal e limpar seleção
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVerses([]);
  };

  // Adicionar versículos selecionados aos favoritos
  const handleAddToFavorites = (verses: Verse[]) => {
    if (verses && verses.length) {
      verses.forEach(verse => addFavorite(verse));
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
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
  
  // Obter título do livro e capítulo
  const bookTitle = book.name || '';
  const chapterTitle = chapter || '1';
  
  return (
    <div className="pb-20 max-w-4xl mx-auto">
      <header className="py-3 px-4 flex items-center justify-between border-b sticky top-0 bg-white z-10">
        <div className="flex items-center">
          <Link to="/biblia" className="mr-3">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold">{bookTitle} {chapterTitle}</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <VolumeIcon className="h-5 w-5" />
          </button>
          
          <div>
            <BibleVersionSelector 
              version={version} 
              onChange={setVersion}
            />
          </div>
        </div>
      </header>
      
      <ChapterSelector book={book} currentChapter={chapterTitle} />
      
      <main ref={versesContainerRef} className="px-4 py-2 space-y-1 mb-16">
        {verses && verses.length > 0 ? (
          <>
            <div className="text-center mb-8 mt-2">
              <h2 className="text-3xl font-serif text-gray-800">{bookTitle}</h2>
              <h3 className="text-6xl font-bold font-serif text-gray-900 my-4">{chapterTitle}</h3>
              {book.name === "João" && chapterTitle === "1" && (
                <h4 className="text-2xl italic font-serif text-gray-700">A encarnação do Verbo</h4>
              )}
            </div>
            
            {verses.map((verse) => {
              // Verificar se este é o versículo a ser destacado
              const isHighlighted = highlightVerse === verse.verse;
              const isSelected = selectedVerses.some(v => v.id === verse.id);
              const isFav = isFavorite(verse);
              
              return (
                <div
                  key={verse.id}
                  ref={isHighlighted ? highlightedVerseRef : null}
                  className={`transition-colors ${
                    isHighlighted ? 'bg-yellow-50' : ''
                  } ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                >
                  <VerseItem
                    verse={verse}
                    version={version}
                    onSelect={handleVerseSelect}
                    isFavorite={isFav}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </div>
              );
            })}
          </>
        ) : (
          <div className="py-12 text-center text-gray-500">
            <p>Não há versículos disponíveis para este capítulo.</p>
          </div>
        )}
      </main>
      
      <div className="fixed bottom-16 left-0 right-0 z-10">
        <ChapterNavigation book={book} chapter={chapterTitle} />
      </div>
      
      <BibliaBottomNav />
      
      {showModal && (
        <VerseSelectionModal
          verses={selectedVerses}
          version={version}
          onClose={handleCloseModal}
          onAddToFavorites={handleAddToFavorites}
        />
      )}
    </div>
  );
};

export default BibliaBook;
