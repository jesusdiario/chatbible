
import React from "react";
import { useParams } from "react-router-dom";
import { bibleAssistants } from "../config/bibleAssistants";

const LivrosDaBibliaBook = () => {
  const { book } = useParams<{ book?: string }>();
  const config = book ? bibleAssistants[book] : null;

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] text-lg">
        Livro não encontrado.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">
        Converse com {config.title}
      </h1>
      <div className="rounded shadow text-lg bg-slate-900/60 p-6">
        (Chat dedicado para {config.title} em breve!)
      </div>
    </div>
  );
};

export default LivrosDaBibliaBook;
