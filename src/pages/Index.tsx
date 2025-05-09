import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import BookChatLayout from "@/components/BookChatLayout";
import BookLoadingState from "@/components/BookLoadingState";
import BookErrorState from "@/components/BookErrorState";
import BookChatContainer from "@/components/BookChatContainer";
import { useBibleBook } from "@/hooks/useBibleBook";

const FIXED_BOOK_SLUG = "devocional-diario"; // slug único do livro

interface LocationState {
  initialPrompt?: string;
  systemPrompt?: string;
}

const DevocionalBook = () => {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 1️⃣  Título do chat
const isDevocional = bookSlug === 'devocional-diario';
const pageTitle = isDevocional
  ? 'Devocional Diário'               // antes: `Converse sobre ${bookTitle}`
  : `Converse sobre ${bookTitle}`;

// 2️⃣  Placeholder do campo de entrada
const inputPlaceholder = isDevocional
  ? 'Crie seu devocional inserindo 1 versículo'   // antes: 'Faça uma pergunta sobre ...'
  : `Faça uma pergunta sobre ${bookTitle.toLowerCase()}...`;

// 3️⃣  Texto do botão (onde era “Guia de Estudo”)
<Button size="sm">
  {isDevocional ? 'Temas de Devocionais' : 'Guia de Estudo'}
</Button>

  // Logs iniciais
  useEffect(() => {
    console.log("[DevocionalBook] Mounted", { slug });
  }, [slug]);

  const { bookDetails, loadingBook } = useBibleBook(FIXED_BOOK_SLUG);

  useEffect(() => {
    console.log("[DevocionalBook] loadingBook", loadingBook);
  }, [loadingBook]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      console.log("[DevocionalBook] Sidebar toggled", next);
      return next;
    });
  };

  if (loadingBook) {
    console.log("[DevocionalBook] Rendering loading state");
    return (
      <BookLoadingState
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
      />
    );
  }

  if (!bookDetails) {
    console.warn("[DevocionalBook] bookDetails not found");
    return (
      <BookErrorState
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
      />
    );
  }

  // Render principal
  return (
    <BookChatLayout
      isSidebarOpen={isSidebarOpen}
      onToggleSidebar={handleToggleSidebar}
    >
      <div className="pt-20 pb-6 px-4">
        <div className="max-w-4xl mx-auto w-full">
          <BookChatContainer
            bookDetails={bookDetails}
            book={FIXED_BOOK_SLUG}
            slug={slug}
            initialPrompt={state?.initialPrompt}
            systemPrompt={state?.systemPrompt}
          />
        </div>
      </div>
    </BookChatLayout>
  );
};

export default DevocionalBook;
