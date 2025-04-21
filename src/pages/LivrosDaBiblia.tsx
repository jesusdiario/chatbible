
import React from "react";
import { useNavigate } from "react-router-dom";
import { bibleAssistants } from "../config/bibleAssistants";

const covers: Record<string, string> = {
  genesis: "/public/lovable-uploads/3dcf7aa6-988a-4f32-aab8-c9f52ea5f899.png",
  exodo: "/public/lovable-uploads/5bbeae18-832a-485c-8470-c42548714ad8.png",
  levitico: "/public/lovable-uploads/512b86cc-1679-452e-9984-3cf8b3186573.png",
  numeros: "/public/lovable-uploads/9a50e3be-1951-48fd-a74f-3b8a6c754d72.png",
  // Adicione mais caminhos de imagens conforme necessário
};

const LivrosDaBiblia = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 min-h-screen bg-chatgpt-main text-white">
      <h1 className="text-2xl font-semibold mb-4">Pentateuco</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Object.entries(bibleAssistants).map(([slug, { title }]) => (
          <div
            key={slug}
            onClick={() => navigate(`/livros-da-biblia/${slug}`)}
            className="block rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition cursor-pointer bg-token-sidebar-surface-secondary"
          >
            <img
              src={covers[slug] || ""}
              alt={`Capa de ${title}`}
              className="w-full h-48 object-cover"
            />
            <div className="p-2 bg-token-sidebar-surface-secondary">
              <span className="text-sm font-medium text-white">{title}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LivrosDaBiblia;
