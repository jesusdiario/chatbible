
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ChatHeader from "@/components/ChatHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSidebarControl } from "@/hooks/useSidebarControl";
import BookChatContainer from "@/components/BookChatContainer";
import { supabase } from "@/integrations/supabase/client";
import { BibleBook } from "@/types/bible";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebarControl();
  const [isLoading, setIsLoading] = useState(true);
  const [bookDetails, setBookDetails] = useState<BibleBook | null>(null);
  const { t } = useTranslation();
  
  const DEVOCIONAL_ID = "59a90833-ab60-42fc-9a2f-8f33f2d30226";
  const DEVOCIONAL_SLUG = "devocional-diario";
  
  useEffect(() => {
    const fetchDevocionalBook = async () => {
      try {
        const { data, error } = await supabase
          .from('bible_books')
          .select('*')
          .eq('id', DEVOCIONAL_ID)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setBookDetails({
            id: data.id,
            title: "Devocional Diário",
            slug: data.slug || DEVOCIONAL_SLUG,
            image_url: data.image_url,
            description: data.description || "",
            category_id: data.category_id,
            book_category: data.book_category,
            display_order: data.display_order
          });
        }
        
      } catch (error) {
        console.error("Error fetching devocional book:", error);
        // Fallback to default data if fetch fails
        setBookDetails({
          id: DEVOCIONAL_ID,
          title: "Devocional Diário",
          slug: DEVOCIONAL_SLUG,
          image_url: "",
          description: "",
          category_id: "",
          book_category: "new_testament",
          display_order: 0
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDevocionalBook();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row h-screen">
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
          <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
          <div className="pt-[60px] pb-4 flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
        <div className="pt-[60px] pb-4 px-4 md:px-8 h-full">
          {bookDetails && (
            <div className="max-w-4xl mx-auto w-full h-full">
              <BookChatContainer
                bookDetails={{
                  ...bookDetails,
                  title: "Devocional Diário" // Override title to ensure it's correct
                }}
                book={DEVOCIONAL_SLUG}
                isDevocional={true}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
