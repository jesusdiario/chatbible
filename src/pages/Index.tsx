
import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import BookChatLayout from "@/components/BookChatLayout";
import BookLoadingState from "@/components/BookLoadingState";
import BookErrorState from "@/components/BookErrorState";
import BookChatContainer from "@/components/BookChatContainer";
import { useBibleBook } from "@/hooks/useBibleBook";

const FIXED_BOOK_SLUG = "sua-vida-em-cristo"; // Alterado de "devocional-diario" para "sua-vida-em-cristo"

interface LocationState {
  initialPrompt?: string;
  systemPrompt?: string;
}

const SuaVidaEmCristo = () => {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Logs iniciais
  useEffect(() => {
    console.log("[SuaVidaEmCristo] Mounted", { slug });
  }, [slug]);

  const { bookDetails, loadingBook } = useBibleBook(FIXED_BOOK_SLUG);

  useEffect(() => {
    console.log("[SuaVidaEmCristo] loadingBook", loadingBook);
  }, [loadingBook]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      console.log("[SuaVidaEmCristo] Sidebar toggled", next);
      return next;
    });
  };

  if (loadingBook) {
    console.log("[SuaVidaEmCristo] Rendering loading state");
    return (
      <BookLoadingState
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
      />
    );
  }

  if (!bookDetails) {
    console.warn("[SuaVidaEmCristo] bookDetails not found");
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

export default SuaVidaEmCristo;
