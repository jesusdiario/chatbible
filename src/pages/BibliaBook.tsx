
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useBook, useVersesByBookChapter } from '@/hooks/useBiblia';
import BibliaBottomNav from '@/components/biblia/BibliaBottomNav';
import { Loader2, ChevronLeft, Book as BookIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import ChapterNavigation from '@/components/biblia/ChapterNavigation';
import ChapterSelector from '@/components/biblia/ChapterSelector';
import VerseItem from '@/components/biblia/VerseItem';
import VerseSelectionModal from '@/components/biblia/VerseSelectionModal';
import { Verse, BibleVersion } from '@/services/bibliaService';

const BibliaBook: React.FC = () => {
  const { bookId, chapter } = useParams<{ bookId: string; chapter: string }>();
  const [searchParams] = useSearchParams();
  const highlightVerseStr = searchParams.get('highlight');
  
  // Estado para controlar a versão da Bíblia
  const [version, setVersion] = useState<BibleVersion>('acf');
  
  // Referências para elementos DOM
  const versesContainerRef = useRef<HTMLDivElement>(null);
  const highlightedVerseRef = useRef<HTMLDivElement | null>(null);
  
  // Estado para seleção de versículos
  const [selectedVerses, setSelectedVerses] = useState<Verse[]>([]);
  const [showModal, setShowModal] = useState(false);
  
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
  
  // Fechar o modal e limpar seleção
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVerses([]);
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
  
  return (
    <div className="pb-20 max-w-4xl mx-auto">
      <header className="py-4 px-4 flex items-center border-b sticky top-0 bg-white z-10">
        <Link to="/biblia" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold flex items-center">
          <BookIcon className="h-5 w-5 mr-2" />
          {book.name} {chapter}
        </h1>
        
        <div className="ml-auto">
          <select
            value={version}
            onChange={(e) => setVersion(e.target.value as BibleVersion)}
            className="border border-gray-200 rounded-lg py-1 px-2 text-sm"
          >
            <option value="acf">ACF</option>
            <option value="ara">ARA</option>
            <option value="arc">ARC</option>
            <option value="naa">NAA</option>
            <option value="ntlh">NTLH</option>
            <option value="nvi">NVI</option>
            <option value="nvt">NVT</option>
          </select>
        </div>
      </header>
      
      <ChapterSelector book={book} currentChapter={chapter || '1'} />
      
      <main ref={versesContainerRef} className="px-4 py-2 space-y-1 mb-16">
        {verses && verses.length > 0 ? (
          verses.map((verse) => {
            // Verificar se este é o versículo a ser destacado
            const isHighlighted = highlightVerse === verse.verse;
            const isSelected = selectedVerses.some(v => v.id === verse.id);
            
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
                />
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-gray-500">
            <p>Não há versículos disponíveis para este capítulo.</p>
          </div>
        )}
      </main>
      
      <div className="fixed bottom-16 left-0 right-0 z-10">
        <ChapterNavigation book={book} chapter={chapter || '1'} />
      </div>
      
      <BibliaBottomNav />
      
      {showModal && (
        <VerseSelectionModal
          verses={selectedVerses}
          version={version}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default BibliaBook;
