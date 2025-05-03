
import React from 'react';
import { Book } from '@/types/biblia';
import BibliaBookItem from './BibliaBookItem';
import { useBooks } from '@/hooks/useBiblia';
import { Bookmark } from 'lucide-react';

interface BibliaBooksListProps {
  books?: Book[];
  isLoading?: boolean;
}

const BibliaBooksList: React.FC<BibliaBooksListProps> = ({ 
  books: propBooks, 
  isLoading: propIsLoading 
}) => {
  // Usar os livros passados como prop ou buscar do hook se não fornecidos
  const { data: hookBooks, isLoading: hookIsLoading } = useBooks();
  
  const books = propBooks || hookBooks;
  const isLoading = propIsLoading !== undefined ? propIsLoading : hookIsLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex flex-col items-center animate-pulse">
            <div className="w-20 h-20 rounded-full bg-gray-200 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="text-center py-10 flex flex-col items-center">
        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
          <Bookmark className="h-8 w-8 text-gray-500" />
        </div>
        <h2 className="text-xl font-medium mb-2">Nenhum livro encontrado</h2>
        <p className="text-gray-500">
          Não foi possível carregar os livros da Bíblia. Tente novamente mais tarde.
        </p>
      </div>
    );
  }

  // Organizar os livros em ordem alfabética por nome
  const sortedBooks = [...books].sort((a, b) => 
    a.name.localeCompare(b.name, 'pt-BR')
  );

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {sortedBooks.map((book) => (
        <BibliaBookItem key={book.id} book={book} />
      ))}
    </div>
  );
};

export default BibliaBooksList;
