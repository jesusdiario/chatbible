
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Settings, Sun, Moon, Type, BookOpen } from 'lucide-react';
import BibliaBottomNav from '@/components/biblia/BibliaBottomNav';
import { BibleVersion } from '@/services/bibliaService';

const BibliaConfiguracoes: React.FC = () => {
  // Estado para preferências do usuário
  const [defaultVersion, setDefaultVersion] = useState<BibleVersion>('acf');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  
  // Carregar configurações salvas
  useEffect(() => {
    const savedVersion = localStorage.getItem('bible-default-version') as BibleVersion | null;
    if (savedVersion) setDefaultVersion(savedVersion);
    
    const savedFontSize = localStorage.getItem('bible-font-size') as 'small' | 'medium' | 'large' | null;
    if (savedFontSize) setFontSize(savedFontSize);
    
    const savedTheme = localStorage.getItem('bible-theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) setTheme(savedTheme);
  }, []);
  
  // Salvar mudanças nas configurações
  const saveVersion = (version: BibleVersion) => {
    setDefaultVersion(version);
    localStorage.setItem('bible-default-version', version);
  };
  
  const saveFontSize = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
    localStorage.setItem('bible-font-size', size);
    
    // Aplicar tamanho da fonte ao corpo do documento
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
    
    switch (size) {
      case 'small':
        document.documentElement.classList.add('text-sm');
        break;
      case 'medium':
        document.documentElement.classList.add('text-base');
        break;
      case 'large':
        document.documentElement.classList.add('text-lg');
        break;
    }
  };
  
  const saveTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('bible-theme', newTheme);
    
    // Aplicar tema
    if (newTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', systemPrefersDark);
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };
  
  // Opções para seleção de versão
  const versionOptions: { value: BibleVersion; label: string }[] = [
    { value: 'acf', label: 'ACF - Almeida Corrigida Fiel' },
    { value: 'ara', label: 'ARA - Almeida Revista e Atualizada' },
    { value: 'arc', label: 'ARC - Almeida Revista e Corrigida' },
    { value: 'naa', label: 'NAA - Nova Almeida Atualizada' },
    { value: 'ntlh', label: 'NTLH - Nova Tradução na Linguagem de Hoje' },
    { value: 'nvi', label: 'NVI - Nova Versão Internacional' },
    { value: 'nvt', label: 'NVT - Nova Versão Transformadora' }
  ];
  
  return (
    <div className="pb-20 max-w-4xl mx-auto">
      <header className="py-4 px-4 flex items-center border-b sticky top-0 bg-white z-10">
        <Link to="/biblia" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Configurações
        </h1>
      </header>
      
      <div className="p-4 space-y-6">
        {/* Versão padrão da Bíblia */}
        <div>
          <h2 className="text-lg font-medium mb-3 flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Versão padrão da Bíblia
          </h2>
          
          <select
            value={defaultVersion}
            onChange={(e) => saveVersion(e.target.value as BibleVersion)}
            className="w-full border border-gray-300 rounded-lg py-2 px-3"
          >
            {versionOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-2">
            Esta será a versão padrão utilizada ao abrir a Bíblia.
          </p>
        </div>
        
        {/* Tamanho da fonte */}
        <div>
          <h2 className="text-lg font-medium mb-3 flex items-center">
            <Type className="h-5 w-5 mr-2" />
            Tamanho da fonte
          </h2>
          
          <div className="flex gap-4">
            <button
              onClick={() => saveFontSize('small')}
              className={`flex-1 py-2 px-4 rounded-lg border ${fontSize === 'small' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300'}`}
            >
              Pequena
            </button>
            <button
              onClick={() => saveFontSize('medium')}
              className={`flex-1 py-2 px-4 rounded-lg border ${fontSize === 'medium' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300'}`}
            >
              Média
            </button>
            <button
              onClick={() => saveFontSize('large')}
              className={`flex-1 py-2 px-4 rounded-lg border ${fontSize === 'large' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300'}`}
            >
              Grande
            </button>
          </div>
        </div>
        
        {/* Tema */}
        <div>
          <h2 className="text-lg font-medium mb-3 flex items-center">
            {theme === 'light' ? (
              <Sun className="h-5 w-5 mr-2" />
            ) : theme === 'dark' ? (
              <Moon className="h-5 w-5 mr-2" />
            ) : (
              <div className="h-5 w-5 mr-2 relative">
                <Sun className="h-5 w-5 absolute" style={{ clipPath: 'inset(0 50% 0 0)' }} />
                <Moon className="h-5 w-5 absolute" style={{ clipPath: 'inset(0 0 0 50%)' }} />
              </div>
            )}
            Tema
          </h2>
          
          <div className="flex gap-4">
            <button
              onClick={() => saveTheme('light')}
              className={`flex-1 py-2 px-4 rounded-lg border ${theme === 'light' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300'}`}
            >
              <Sun className="h-4 w-4 mx-auto mb-1" />
              Claro
            </button>
            <button
              onClick={() => saveTheme('dark')}
              className={`flex-1 py-2 px-4 rounded-lg border ${theme === 'dark' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300'}`}
            >
              <Moon className="h-4 w-4 mx-auto mb-1" />
              Escuro
            </button>
            <button
              onClick={() => saveTheme('system')}
              className={`flex-1 py-2 px-4 rounded-lg border ${theme === 'system' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300'}`}
            >
              <div className="h-4 w-4 mx-auto mb-1 relative">
                <Sun className="h-4 w-4 absolute" style={{ clipPath: 'inset(0 50% 0 0)' }} />
                <Moon className="h-4 w-4 absolute" style={{ clipPath: 'inset(0 0 0 50%)' }} />
              </div>
              Sistema
            </button>
          </div>
        </div>
      </div>
      
      <BibliaBottomNav />
    </div>
  );
};

export default BibliaConfiguracoes;
