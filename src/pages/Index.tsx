
import React, { useEffect, useState } from "react";
import { useSidebarControl } from "@/hooks/useSidebarControl";
import { useBibleBook } from "@/hooks/useBibleBook";
import BookChatContainer from "@/components/BookChatContainer";
import BookLoadingState from "@/components/BookLoadingState";
import BookErrorState from "@/components/BookErrorState";
import { BibleBook } from "@/types/bible";

const Index = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebarControl();
  const [error, setError] = useState<any>(null);
  
  // Slug fixo para o Devocional Diário
  const bookSlug = "devocional-diario";
  
  const { bookDetails, loadingBook } = useBibleBook(bookSlug);

  if (loadingBook) {
    return <BookLoadingState isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />;
  }

  if (!bookDetails || error) {
    return <BookErrorState isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'} bg-chatgpt-main`}>
        <BookChatContainer 
          bookDetails={bookDetails}
          book={bookSlug}
          slug={bookSlug}
        />
      </main>
    </div>
  );
};

export default Index;
