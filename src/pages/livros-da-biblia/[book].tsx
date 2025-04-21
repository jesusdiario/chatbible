
import React from "react";
import { useParams } from "react-router-dom";
import AssistantChat from "../../components/AssistantChat";
import { bibleAssistants } from "../../config/bibleAssistants";
import { quickPrompts } from "../../config/quickPrompts";
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";

const BibleBookPage = () => {
  const { book } = useParams<{ book?: string }>();
  const config = book ? bibleAssistants[book] : null;
  const suggestions = book ? (quickPrompts[book] || []) : [];

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [apiKey, setApiKey] = React.useState<string>("");

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem("openai_api_key", newApiKey);
  };

  if (!config) {
    return (
      <div className="flex h-screen">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onApiKeyChange={handleApiKeyChange}
        />
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
          <ChatHeader
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <div className="pt-[60px] flex items-center justify-center min-h-[70vh] text-lg">
            Livro não encontrado.
          </div>
        </main>
      </div>
    );
  }

  const handleQuick = (text: string) => {
    // Dispara o evento global para o AssistantChat captar
    window.dispatchEvent(new CustomEvent("assistant-message", { detail: text }));
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onApiKeyChange={handleApiKeyChange}
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
        <ChatHeader
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="pt-[60px] px-6 flex flex-col h-full">
          <h1 className="text-3xl font-bold mb-6">
            Converse com {config.title}
          </h1>
          <AssistantChat
            assistantId={config.assistantId}
            placeholder={`O que você gostaria de aprender sobre ${config.title}?`}
            className="flex-1 mb-4"
          />
          <div className="flex gap-3 overflow-x-auto mb-4">
            {suggestions.map((q) => (
              <button
                key={q}
                onClick={() => handleQuick(q)}
                className="px-4 py-2 border border-gray-600 rounded-full hover:bg-gray-700 text-sm whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BibleBookPage;
