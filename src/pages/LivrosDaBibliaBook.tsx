
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBibleBookBySlug } from "@/services/bibleService";
import { useBibleSuggestions } from "@/hooks/useBibleSuggestions";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BookChat } from "@/components/BookChat";
import { BookLoadingState } from "@/components/BookLoadingState";
import { BookErrorState } from "@/components/BookErrorState";
import { StudyGuideButton } from "@/components/StudyGuide/StudyGuideButton";

const LivrosDaBibliaBook: React.FC = () => {
  const { book, slug: chatSlug } = useParams<{ book: string, slug?: string }>();
  const navigate = useNavigate();
  const [bookData, setBookData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { data: suggestions = [], isLoading: suggestionsLoading } = useBibleSuggestions(book || '');

  useEffect(() => {
    const fetchBookData = async () => {
      if (!book) {
        setError("ID do livro não fornecido");
        setLoading(false);
        return;
      }

      try {
        const data = await getBibleBookBySlug(book);
        if (!data) {
          setError("Livro não encontrado");
        } else {
          setBookData(data);
          setError(null);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do livro:", error);
        setError("Erro ao carregar livro");
      } finally {
        setLoading(false);
      }
    };

    fetchBookData();
  }, [book]);

  const handleSelectSuggestion = (suggestion: any) => {
    // Create a chat slug if needed
    const newSlug = suggestion.id;
    navigate(`/livros-da-biblia/${book}/${newSlug}`);
  };

  if (loading) {
    return <BookLoadingState />;
  }

  if (error || !bookData) {
    return <BookErrorState message={error || "Dados não disponíveis"} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container px-4 py-6 mx-auto max-w-screen-xl">
        <div className="flex flex-wrap items-center justify-between mb-8">
          <h1 className="text-2xl font-bold md:text-3xl">{bookData.title}</h1>
          
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <StudyGuideButton 
              bookSlug={book || ''} 
              onSelectSuggestion={handleSelectSuggestion} 
            />
            
            <Button
              variant="outline"
              onClick={() => navigate("/livros-da-biblia")}
            >
              Voltar
            </Button>
          </div>
        </div>

        {suggestionsLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div>
            {chatSlug ? (
              <BookChat
                bookSlug={book || ''}
                chatSlug={chatSlug}
                suggestions={suggestions}
                onSelectSuggestion={handleSelectSuggestion}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="p-4 bg-white border rounded-lg shadow-sm cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    <h3 className="mb-2 font-medium">{suggestion.label}</h3>
                    {suggestion.description && (
                      <p className="text-sm text-gray-600">
                        {suggestion.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LivrosDaBibliaBook;
