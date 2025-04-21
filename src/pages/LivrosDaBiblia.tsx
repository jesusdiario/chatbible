
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";

type BibleAssistant = {
  slug: string;
  title: string;
  assistant_id: string;
  category: string;
  description: string | null;
  display_order: number | null;
};

type CategoryGroup = {
  title: string;
  items: BibleAssistant[];
};

const LivrosDaBiblia = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      const { data, error } = await supabase
        .from('bible_assistants')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        throw error;
      }

      // Agrupar assistentes por categoria
      const groupedData = data.reduce((acc: { [key: string]: BibleAssistant[] }, assistant) => {
        if (!acc[assistant.category]) {
          acc[assistant.category] = [];
        }
        acc[assistant.category].push(assistant);
        return acc;
      }, {});

      // Converter para o formato final
      const formattedCategories = Object.entries(groupedData).map(([title, items]) => ({
        title,
        items
      }));

      setCategories(formattedCategories);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar assistentes",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('openai_api_key', newApiKey);
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        onApiKeyChange={handleApiKeyChange}
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="pt-[60px] pb-4 px-8 bg-chatgpt-main text-white min-h-screen">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            categories.map(({ title, items }) => (
              <section key={title} className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mt-6 mb-4">{title}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {items.map(assistant => (
                    <Link
                      key={assistant.slug}
                      to={`/livros-da-biblia/${assistant.slug}`}
                      className="block rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition bg-chatgpt-sidebar border border-chatgpt-border"
                    >
                      <img
                        src={`/images/covers/${assistant.slug}.jpg`}
                        alt={`Capa de ${assistant.title}`}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4 bg-chatgpt-secondary">
                        <h3 className="text-lg font-medium mb-2">{assistant.title}</h3>
                        {assistant.description && (
                          <p className="text-sm text-gray-300">{assistant.description}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default LivrosDaBiblia;
