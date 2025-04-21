
import React from "react";
import { Link } from "react-router-dom";
import { bibleAssistants } from "../config/bibleAssistants";

const pentateucoSlugs = ["genesis", "exodo", "levitico", "numeros"];

const LivrosDaBiblia = () => {
  return (
    <div className="flex flex-col min-h-screen bg-chatgpt-main text-white">
      <header className="w-full px-8 py-6">
        <h1 className="text-2xl md:text-3xl font-bold">Pentateuco</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-5 mb-10">
          {pentateucoSlugs.map((slug) => {
            const { title } = bibleAssistants[slug];
            return (
              <Link
                key={slug}
                to={`/livros-da-biblia/${slug}`}
                className="block rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition bg-chatgpt-sidebar border border-chatgpt-border"
              >
                <img
                  src={`/images/covers/${slug}.jpg`}
                  alt={`Capa de ${title}`}
                  className="w-full h-48 object-cover"
                />
                <div className="p-2 bg-chatgpt-secondary">
                  <span className="text-sm font-medium">{title}</span>
                </div>
              </Link>
            );
          })}
        </div>
        {/* Add further sections (Históricos, Poéticos e Proféticos) as desired here */}
        <h2 className="text-xl font-semibold mt-6 mb-2">Históricos</h2>
        <div className="min-h-[56px] mb-8"></div>
        <h2 className="text-xl font-semibold mt-6 mb-2">Poéticos e Proféticos</h2>
        <div className="min-h-[56px]"></div>
      </header>
    </div>
  );
};

export default LivrosDaBiblia;
