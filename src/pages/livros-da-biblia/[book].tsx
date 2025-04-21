
import React from "react";
import { useParams } from "react-router-dom";
import AssistantChat from "../../components/AssistantChat";
import { bibleAssistants } from "../../config/bibleAssistants";

const BibleBookChatPage = () => {
  const { book } = useParams<{ book: string }>();
  const config = book ? bibleAssistants[book] : undefined;

  if (!config)
    return (
      <div className="p-6">
        <p>Livro não encontrado.</p>
      </div>
    );

  return (
    <div className="p-6 min-h-screen bg-chatgpt-main text-white">
      <h1 className="text-3xl font-bold mb-4">
        Converse com {config.title}
      </h1>
      <AssistantChat
        assistantId={config.assistantId}
        placeholder={`O que você gostaria de aprender sobre ${config.title}?`}
        className="h-[calc(100vh-180px)]"
      />
    </div>
  );
};

export default BibleBookChatPage;
