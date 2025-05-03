import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Biblia from '@/pages/Biblia';
import BibliaBook from '@/pages/BibliaBook';
import BibliaPesquisar from '@/pages/BibliaPesquisar';
import BibliaFavoritos from '@/pages/BibliaFavoritos';
import BibliaConfiguracoes from '@/pages/BibliaConfiguracoes';
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Admin from "@/pages/Admin";
import AdminPages from "@/pages/AdminPages";
import AdminBooks from "@/pages/AdminBooks";
import LivrosDaBiblia from "@/pages/LivrosDaBiblia";
import LivrosDaBibliaBook from "@/pages/LivrosDaBibliaBook";
import TemasDaBiblia from "@/pages/TemasDaBiblia";
import TeologiaCrista from "@/pages/TeologiaCrista";
import Lexicon from "@/pages/Lexicon";
import Profile from "@/pages/Profile";
import ChatHistory from "@/pages/ChatHistory";
import ChatPage from "@/pages/ChatPage";
import LandingPage from "@/pages/LandingPage";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rotas da Bíblia */}
      <Route path="/biblia" element={<Biblia />} />
      <Route path="/biblia/:bookId/:chapter" element={<BibliaBook />} />
      <Route path="/biblia/pesquisar" element={<BibliaPesquisar />} />
      <Route path="/biblia/favoritos" element={<BibliaFavoritos />} />
      <Route path="/biblia/configuracoes" element={<BibliaConfiguracoes />} />
      
      {/* Outras rotas existentes */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<Index />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/paginas" element={<AdminPages />} />
      <Route path="/admin/livros" element={<AdminBooks />} />
      <Route path="/livros-da-biblia" element={<LivrosDaBiblia />} />
      <Route path="/temas-da-biblia" element={<TemasDaBiblia />} />
      <Route path="/teologia-crista" element={<TeologiaCrista />} />
      <Route path="/livros-da-biblia/:book" element={<LivrosDaBibliaBook />} />
      <Route path="/livros-da-biblia/:book/:slug" element={<LivrosDaBibliaBook />} />
      <Route path="/chat/:slug" element={<ChatPage />} />
      <Route path="/history" element={<ChatHistory />} />
      <Route path="/lexicon" element={<Lexicon />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/lp" element={<LandingPage />} />
    </Routes>
  );
};
