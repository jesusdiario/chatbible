
import React, { useState } from 'react';
import { Settings, Sun, Moon, Type, Book, ChevronRight } from 'lucide-react';
import BibliaBottomNav from '@/components/biblia/BibliaBottomNav';
import { BibleVersion } from '@/types/biblia';
import { BibleVersionSelectorFull } from '@/components/biblia/BibleVersionSelector';

const BibliaConfiguracoes = () => {
  // Estado para preferências do usuário
  const [fontSize, setFontSize] = useState<string>('medium');
  const [theme, setTheme] = useState<string>('light');
  const [defaultVersion, setDefaultVersion] = useState<BibleVersion>('acf');
  
  // Opções de tamanho de texto
  const fontSizeOptions = [
    { id: 'small', label: 'Pequeno', class: 'text-sm' },
    { id: 'medium', label: 'Médio', class: 'text-base' },
    { id: 'large', label: 'Grande', class: 'text-lg' },
    { id: 'xlarge', label: 'Extra Grande', class: 'text-xl' },
  ];
  
  // Opções de tema
  const themeOptions = [
    { id: 'light', label: 'Claro', icon: Sun },
    { id: 'dark', label: 'Escuro', icon: Moon },
  ];
  
  // Handler para salvar configurações
  const saveSettings = () => {
    // Salvar em localStorage ou em um serviço de configurações
    localStorage.setItem('bible-font-size', fontSize);
    localStorage.setItem('bible-theme', theme);
    localStorage.setItem('bible-default-version', defaultVersion);
    
    // Notificar usuário
    alert('Configurações salvas com sucesso!');
  };
  
  return (
    <div className="pb-20 max-w-4xl mx-auto">
      <header className="py-4 px-4 flex items-center border-b sticky top-0 bg-white z-10">
        <h1 className="text-xl font-bold flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Configurações
        </h1>
      </header>
      
      <main className="px-4 py-4">
        <div className="space-y-6">
          {/* Seção de Aparência */}
          <section className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="font-medium">Aparência</h3>
            </div>
            
            {/* Tamanho da Fonte */}
            <div className="p-4 border-b">
              <div className="flex items-center mb-3">
                <Type className="h-5 w-5 text-gray-600 mr-2" />
                <h4 className="font-medium">Tamanho da Fonte</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {fontSizeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFontSize(option.id)}
                    className={`border rounded-lg p-3 text-center ${
                      fontSize === option.id 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200'
                    }`}
                  >
                    <span className={option.class}>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Tema */}
            <div className="p-4">
              <div className="flex items-center mb-3">
                <Sun className="h-5 w-5 text-gray-600 mr-2" />
                <h4 className="font-medium">Tema</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setTheme(option.id)}
                      className={`border rounded-lg p-3 flex items-center justify-center ${
                        theme === option.id 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
          
          {/* Versão Padrão da Bíblia */}
          <section className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="font-medium">Preferências de Leitura</h3>
            </div>
            
            <div className="p-4">
              <div className="flex items-center mb-3">
                <Book className="h-5 w-5 text-gray-600 mr-2" />
                <h4 className="font-medium">Versão Padrão da Bíblia</h4>
              </div>
              
              <BibleVersionSelectorFull
                version={defaultVersion}
                onChange={setDefaultVersion}
                className="w-full"
              />
              
              <p className="text-sm text-gray-500 mt-2">
                Esta será a versão exibida por padrão ao abrir qualquer passagem da Bíblia.
              </p>
            </div>
          </section>
          
          {/* Outras Configurações */}
          <section className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="font-medium">Outras Configurações</h3>
            </div>
            
            <div className="divide-y">
              <button className="w-full p-4 text-left flex items-center justify-between">
                <span>Limpar Histórico de Leitura</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
              
              <button className="w-full p-4 text-left flex items-center justify-between">
                <span>Reportar Problema</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
              
              <button className="w-full p-4 text-left flex items-center justify-between">
                <span>Sobre</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </section>
          
          {/* Botão de Salvar */}
          <button
            onClick={saveSettings}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium"
          >
            Salvar Configurações
          </button>
        </div>
      </main>
      
      <BibliaBottomNav />
    </div>
  );
};

export default BibliaConfiguracoes;
