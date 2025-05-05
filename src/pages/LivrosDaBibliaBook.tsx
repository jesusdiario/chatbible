
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import BookChatLayout from "@/components/BookChatLayout";
import BookLoadingState from "@/components/BookLoadingState";
import BookErrorState from "@/components/BookErrorState";
import BookChatContainer from "@/components/BookChatContainer";
import { useBibleBook } from "@/hooks/useBibleBook";

const LivrosDaBibliaBook = () => {
  const { book, slug } = useParams<{ book?: string, slug?: string }>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { bookDetails, loadingBook } = useBibleBook(book);

  if (loadingBook) {
    return <BookLoadingState 
      isSidebarOpen={isSidebarOpen} 
      onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
    />;
  }

  if (!bookDetails) {
    return <BookErrorState 
      isSidebarOpen={isSidebarOpen} 
      onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
    />;
  }

  return (
    <BookChatLayout 
      isSidebarOpen={isSidebarOpen}
      onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
    >
      <div className="pt-20 pb-6 px-4">
        <div className="max-w-4xl mx-auto w-full">
          <BookChatContainer
            bookDetails={bookDetails}
            book={book}
            slug={slug}
          />
        </div>
      </div>
    </BookChatLayout>
  );
};

export default LivrosDaBibliaBook;
