
import React from "react";
import { useBibleBook } from "@/hooks/useBibleBook";
import BookChatContainer from "@/components/BookChatContainer";
import Sidebar from "@/components/Sidebar";
import ChatHeader from "@/components/ChatHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSidebarControl } from "@/hooks/useSidebarControl";
import BookErrorState from "@/components/BookErrorState";

const Index = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebarControl();
  const { 
    bookDetails, 
    isLoading, 
    isError, 
    error 
  } = useBibleBook('devocional-diario');

  if (isError) {
    return (
      <div className="flex flex-col md:flex-row h-screen">
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
          <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
          <BookErrorState error={error} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
        {isLoading ? (
          <div className="w-full h-full flex justify-center items-center pt-[60px]">
            <LoadingSpinner />
          </div>
        ) : (
          <BookChatContainer 
            bookDetails={bookDetails} 
            book="devocional-diario"
            slug={`chat-devocional-diario-${Date.now()}`}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
