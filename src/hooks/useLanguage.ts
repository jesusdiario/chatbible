
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const SUPPORTED_LANGUAGES = ['en', 'pt-BR', 'es'];

type Language = 'en' | 'pt-BR' | 'es';

export function useLanguage() {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    (localStorage.getItem('i18nextLng') || 'pt-BR') as Language
  );
  const [isLoading, setIsLoading] = useState(false);

  // Handle language initialization
  useEffect(() => {
    const storedLanguage = localStorage.getItem('i18nextLng');
    if (storedLanguage && SUPPORTED_LANGUAGES.includes(storedLanguage)) {
      setCurrentLanguage(storedLanguage as Language);
    } else {
      // Detect browser language
      const browserLang = navigator.language;
      const detectedLang = SUPPORTED_LANGUAGES.find(
        lang => browserLang.startsWith(lang) || lang.startsWith(browserLang)
      ) || 'pt-BR';
      
      setCurrentLanguage(detectedLang as Language);
      localStorage.setItem('i18nextLng', detectedLang);
      i18n.changeLanguage(detectedLang);
    }
  }, [i18n]);

  const changeLanguage = async (lang: Language) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;
    
    setIsLoading(true);
    
    try {
      // Change language in i18next
      await i18n.changeLanguage(lang);
      localStorage.setItem('i18nextLng', lang);
      setCurrentLanguage(lang);
      
      // Save preference to user profile if logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Using a raw SQL query/RPC since we don't have access to the typed table
        await supabase.rpc('update_language_preference', { 
          user_id: session.user.id,
          language: lang
        });
      }
      
      toast({
        title: i18n.t('settings.languageChanged'),
        description: i18n.t('settings.languageChangedDescription'),
      });
      
    } catch (error) {
      console.error('Failed to change language:', error);
      toast({
        variant: 'destructive',
        title: i18n.t('errors.generic'),
        description: i18n.t('errors.languageChangeFailed'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentLanguage,
    changeLanguage,
    isLoading,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}
