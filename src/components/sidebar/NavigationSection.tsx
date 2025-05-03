
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Book, BookOpen, MessageSquare, History, FileText, Home } from 'lucide-react';

type NavigationItem = {
  href: string;
  icon: React.ReactNode;
  label: string;
};

export default function NavigationSection() {
  const navigationItems: NavigationItem[] = [
    {
      href: '/',
      icon: <Home className="h-5 w-5" />,
      label: 'Início'
    },
    {
      href: '/livros-da-biblia',
      icon: <Book className="h-5 w-5" />,
      label: 'Livros da Bíblia'
    },
    {
      href: '/temas-da-biblia',
      icon: <FileText className="h-5 w-5" />,
      label: 'Temas da Bíblia'
    },
    {
      href: '/teologia-crista',
      icon: <MessageSquare className="h-5 w-5" />,
      label: 'Teologia Cristã'
    },
    {
      href: '/history',
      icon: <History className="h-5 w-5" />,
      label: 'Histórico'
    },
    {
      href: '/biblia-online',
      icon: <BookOpen className="h-5 w-5" />,
      label: 'Bíblia Online'
    }
  ];

  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Navegação</h2>
      <div className="space-y-1">
        {navigationItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) => 
              `flex items-center justify-start gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-secondary 
              ${isActive ? 'bg-secondary text-primary' : 'text-muted-foreground'}`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
