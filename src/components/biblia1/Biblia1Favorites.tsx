
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FavoriteItem } from '@/services/biblia1Service';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Star, 
  X, 
  Calendar, 
  ChevronDown, 
  ChevronUp,
  BookOpen
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Biblia1FavoritesProps {
  favorites: FavoriteItem[];
  removeFavorite: (favorite: FavoriteItem) => void;
}

const Biblia1Favorites: React.FC<Biblia1FavoritesProps> = ({ favorites, removeFavorite }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'book'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const sortedFavorites = [...favorites].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'asc'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      // Ordena por livro, depois capítulo, depois versículo
      if (a.bookId !== b.bookId) {
        return sortOrder === 'asc'
          ? a.bookId - b.bookId
          : b.bookId - a.bookId;
      }
      if (a.chapter !== b.chapter) {
        return sortOrder === 'asc'
          ? a.chapter - b.chapter
          : b.chapter - a.chapter;
      }
      if (!a.verse && b.verse) return sortOrder === 'asc' ? -1 : 1;
      if (a.verse && !b.verse) return sortOrder === 'asc' ? 1 : -1;
      if (a.verse && b.verse) {
        return sortOrder === 'asc'
          ? a.verse - b.verse
          : b.verse - a.verse;
      }
      return 0;
    }
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  if (favorites.length === 0) {
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          className="fixed bottom-20 left-4 flex items-center p-2 shadow-md z-10"
          size="sm"
        >
          <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
          <span>{favorites.length}</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Meus Favoritos</DialogTitle>
          <DialogDescription>
            {favorites.length} {favorites.length === 1 ? 'item favoritado' : 'itens favoritados'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <Button
              variant={sortBy === 'date' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setSortBy('date')}
              className="text-xs flex items-center"
            >
              <Calendar className="h-3 w-3 mr-1" />
              Por Data
              {sortBy === 'date' && (
                sortOrder === 'desc' ? (
                  <ChevronDown className="h-3 w-3 ml-1" />
                ) : (
                  <ChevronUp className="h-3 w-3 ml-1" />
                )
              )}
            </Button>
            <Button
              variant={sortBy === 'book' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setSortBy('book')}
              className="text-xs flex items-center"
            >
              <BookOpen className="h-3 w-3 mr-1" />
              Por Livro
              {sortBy === 'book' && (
                sortOrder === 'desc' ? (
                  <ChevronDown className="h-3 w-3 ml-1" />
                ) : (
                  <ChevronUp className="h-3 w-3 ml-1" />
                )
              )}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSortOrder}
            className="text-xs"
          >
            {sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
          </Button>
        </div>
        
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {sortedFavorites.map(favorite => (
              <div 
                key={favorite.id} 
                className="bg-white border rounded-md p-3 relative"
              >
                <div className="flex justify-between items-start">
                  <Link
                    to={`/biblia/${favorite.bookId}/${favorite.chapter}${favorite.verse ? `#v${favorite.verse}` : ''}`}
                    className="text-blue-600 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    {favorite.bookName} {favorite.chapter}{favorite.verse ? `:${favorite.verse}` : ''}
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFavorite(favorite)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {favorite.text && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{favorite.text}</p>
                )}
                
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(favorite.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default Biblia1Favorites;
