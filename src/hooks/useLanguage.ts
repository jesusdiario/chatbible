
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import i18n from '@/i18n/i18n';

export type SupportedLanguage = 'pt-BR' | 'en' | 'es';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(i18n.language as SupportedLanguage || 'pt-BR');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Obter o país do usuário pela API de geolocalização
  const detectCountry = useCallback(async () => {
    try {
      const response = await fetch(`https://qdukcxetdfidgxcuwjdo.functions.supabase.co/detect-country`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Erro ao detectar país');
      
      const data = await response.json();
      return data.country;
    } catch (error) {
      console.error('Erro ao detectar país:', error);
      return null;
    }
  }, []);

  // Mapear o código do país para o idioma usando a função do banco de dados
  const mapCountryToLanguage = useCallback(async (countryCode: string): Promise<SupportedLanguage> => {
    try {
      // Usar o mapeamento definido no banco de dados
      const { data, error } = await supabase.rpc('map_country_to_language', { country_code: countryCode });
      
      if (error) throw error;
      
      return data as SupportedLanguage;
    } catch (error) {
      console.error('Erro ao mapear idioma:', error);
      return 'pt-BR'; // Idioma padrão
    }
  }, []);

  // Não é possível salvar o idioma preferido no perfil do usuário pois não existe a coluna preferred_language
  // Usar local storage para salvar a preferência
  const saveLanguagePreference = useCallback(async (language: SupportedLanguage) => {
    localStorage.setItem('i18nextLng', language);
    // O resto da lógica fica comentado pois não temos o campo preferred_language
    /*
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) return;
      
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_language: language })
        .eq('id', session.user.id);
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Erro ao salvar preferência de idioma:', error);
    }
    */
  }, []);

  // Carregar idioma preferido do localStorage apenas
  const loadUserLanguagePreference = useCallback(async (): Promise<SupportedLanguage | null> => {
    const storedLang = localStorage.getItem('i18nextLng');
    if (storedLang && ['pt-BR', 'en', 'es'].includes(storedLang)) {
      return storedLang as SupportedLanguage;
    }
    return null;
    // O resto da lógica fica comentado pois não temos o campo preferred_language
    /*
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('preferred_language')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      
      return data.preferred_language as SupportedLanguage;
    } catch (error) {
      console.error('Erro ao carregar preferência de idioma:', error);
      return null;
    }
    */
  }, []);

  // Mudar o idioma
  const changeLanguage = useCallback(async (language: SupportedLanguage) => {
    setLoading(true);
    
    try {
      await i18n.changeLanguage(language);
      setCurrentLanguage(language);
      localStorage.setItem('i18nextLng', language);
      await saveLanguagePreference(language);
      
      // Use a new toast with translated text
      toast({
        title: i18n.t('profile.languageChanged'),
        description: `${i18n.t('profile.language')}: ${language}`,
      });
    } catch (error) {
      console.error('Erro ao mudar idioma:', error);
      toast({
        title: i18n.t('errors.general'),
        description: String(error),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [i18n, saveLanguagePreference, toast]);

  // Inicialização: detectar idioma do país ou carregar preferência do usuário
  useEffect(() => {
    const initializeLanguage = async () => {
      setLoading(true);
      
      try {
        // Verificar se já existe uma preferência armazenada
        const storedLanguage = localStorage.getItem('i18nextLng');
        
        if (storedLanguage && ['pt-BR', 'en', 'es'].includes(storedLanguage)) {
          await i18n.changeLanguage(storedLanguage);
          setCurrentLanguage(storedLanguage as SupportedLanguage);
          setLoading(false);
          return;
        }
        
        // Verificar preferência do usuário no localStorage
        const userPrefLang = await loadUserLanguagePreference();
        
        if (userPrefLang) {
          await i18n.changeLanguage(userPrefLang);
          setCurrentLanguage(userPrefLang);
          setLoading(false);
          return;
        }
        
        // Se não houver preferência, detectar país e mapear para idioma
        const country = await detectCountry();
        
        if (country) {
          const language = await mapCountryToLanguage(country);
          await i18n.changeLanguage(language);
          setCurrentLanguage(language);
          await saveLanguagePreference(language);
        }
      } catch (error) {
        console.error('Erro ao inicializar idioma:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeLanguage();
  }, [i18n, detectCountry, mapCountryToLanguage, saveLanguagePreference, loadUserLanguagePreference]);

  // Lista de idiomas suportados para selector
  const supportedLanguages = [
    { code: 'pt-BR', name: 'Português' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' }
  ];

  return {
    currentLanguage,
    changeLanguage,
    loading,
    supportedLanguages
  };
};
