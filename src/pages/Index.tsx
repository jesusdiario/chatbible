import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import BookChatLayout from "@/components/BookChatLayout";
import BookLoadingState from "@/components/BookLoadingState";
import BookErrorState from "@/components/BookErrorState";
import BookChatContainer from "@/components/BookChatContainer";
import { useBibleBook } from "@/hooks/useBibleBook";

/**
 * Fixed constants for the unique book we want to expose in this route.
 */
const FIXED_BOOK_SLUG = "devocional-diario";

interface LocationState {
  initialPrompt?: string;
  systemPrompt?: string;
}

/**
 * Component dedicated to the unique "Devocional Diário" book (id: 59a90833-ab60-42fc-9a2f-8f33f2d30226).
 * All other route params are still respected for the chat `slug`, but the book itself is hard‑wired.
 */
const DevocionalBook = () => {
  // `slug` keeps identifying the specific chat thread (if any)
  const { slug } = useParams<{ slug?: string }>();

  // Location state can pass initial/system prompts when the user navigates from elsewhere
  const location = useLocation();
  const state = location.state as LocationState | null;

  // Sidebar toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Always load the fixed book details via the existing hook
  const { bookDetails, loadingBook } = useBibleBook(FIXED_BOOK_SLUG);

  // Handle loading & error states ------------------------------------------------
  if (loadingBook) {
    return (
      <BookLoadingState
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
    );
  }

  if (!bookDetails) {
    return (
      <BookErrorState
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
    );
  }

  // Render the chat UI -----------------------------------------------------------
  return (
    <BookChatLayout
      isSidebarOpen={isSidebarOpen}
      onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
    >
      <div className="pt-20 pb-6 px-4">
        <div className="max-w-4xl mx-auto w-full">
          <BookChatContainer
            bookDetails={bookDetails}
            // We forcibly pass the fixed slug so that downstream hooks/components stay consistent
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
