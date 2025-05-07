
import React, { useEffect, useRef } from 'react';
import { Languages } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
  }
}

const GoogleTranslate: React.FC = () => {
  const translatorInitialized = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    // Skip if already initialized or in SSR
    if (translatorInitialized.current || typeof window === 'undefined') return;
    
    // Add Google Translate script
    const addScript = () => {
      try {
        const script = document.createElement('script');
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
        
        // Define the callback function
        window.googleTranslateElementInit = () => {
          new (window as any).google.translate.TranslateElement(
            {
              pageLanguage: 'pt',
              includedLanguages: 'en,es,pt,fr,de,it,ja,ko,ru,zh-CN,ar',
              layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            },
            'google_translate_element'
          );
        };
        
        translatorInitialized.current = true;
      } catch (error) {
        console.error('Failed to initialize Google Translate', error);
        toast({
          title: "Erro ao carregar tradutor",
          description: "Não foi possível carregar o Google Tradutor.",
          variant: "destructive"
        });
      }
    };

    addScript();

    return () => {
      // Cleanup function
      if (window.googleTranslateElementInit) {
        delete window.googleTranslateElementInit;
      }
      // Remove the script if component unmounts
      const script = document.querySelector('script[src*="translate.google.com"]');
      if (script) {
        script.remove();
      }
    };
  }, [toast]);

  return (
    <div className="flex items-center">
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center space-x-1 text-sm"
        onClick={() => {
          // Toggle Google Translate dropdown
          const element = document.querySelector('.goog-te-combo') as HTMLSelectElement;
          if (element) {
            element.focus();
            element.click();
          }
        }}
      >
        <Languages className="h-4 w-4 mr-1" />
        <span>Traduzir página</span>
      </Button>
      <div id="google_translate_element" className="google-translate-container"></div>
      
      {/* Add styles to customize Google Translate widget */}
      <style jsx>{`
        .google-translate-container {
          display: inline-block;
        }
        /* Hide Google Translate attribution */
        :global(.goog-te-gadget-simple) {
          border: none !important;
          background-color: transparent !important;
          padding: 0 !important;
        }
        :global(.goog-te-gadget-simple img),
        :global(.goog-te-gadget-simple span) {
          display: none !important;
        }
        :global(.goog-te-gadget-simple .goog-te-combo) {
          position: absolute;
          opacity: 0;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          cursor: pointer;
          margin: 0;
          padding: 0;
        }
        :global(.goog-te-banner-frame) {
          display: none !important;
        }
        :global(body) {
          top: 0 !important;
        }
      `}</style>
    </div>
  );
};

export default GoogleTranslate;
