
import React from 'react';
import { useBooksByTestament } from '@/hooks/useBiblia';
import BibliaTestamentSection from '@/components/biblia/BibliaTestamentSection';
import BibliaBottomNav from '@/components/biblia/BibliaBottomNav';
import { Book, Search, User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Biblia: React.FC = () => {
  const { booksByTestament, isLoading, error } = useBooksByTestament();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="mt-4">Carregando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500">
        <p>Erro ao carregar os livros da Bíblia</p>
        <p className="text-sm mt-2">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="pb-20 max-w-4xl mx-auto px-4">
      <header className="pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Bíblia Sagrada</h1>
          <div className="flex space-x-2">
            <Link 
              to="/biblia/pesquisar"
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <Search className="h-5 w-5" />
            </Link>
            <Link 
              to="/profile"
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <User className="h-5 w-5" />
            </Link>
            <Link 
              to="/biblia/configuracoes"
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </div>
        
        <div className="flex mb-6">
          <Link 
            to="/biblia/pesquisar" 
            className="flex-1 py-2 px-4 bg-gray-100 text-gray-600 rounded-lg flex items-center"
          >
            <Search className="h-4 w-4 mr-2 text-gray-400" />
            <span>Buscar na Bíblia...</span>
          </Link>
        </div>
        
        <div className="flex justify-around mb-4">
          <Link 
            to="/biblia/favoritos" 
            className="flex flex-col items-center p-2"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-1">
              <Book className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xs">Favoritos</span>
          </Link>
          
          <Link 
            to="/biblia/pesquisar" 
            className="flex flex-col items-center p-2"
          >
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-1">
              <Search className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-xs">Pesquisar</span>
          </Link>
          
          <Link 
            to="/biblia/configuracoes" 
            className="flex flex-col items-center p-2"
          >
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-1">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-xs">Configurações</span>
          </Link>
        </div>
      </header>
      
      <main>
        {booksByTestament.map(({ testament, books }) => (
          <BibliaTestamentSection 
            key={testament.id} 
            testament={testament} 
            books={books} 
          />
        ))}
      </main>
      
      <BibliaBottomNav />
    </div>
  );
};

export default Biblia;
