import { supabase } from '../integrations/supabase/client';
import { BibleButton } from '../types/buttons';

export const fetchBibleButtons = async (): Promise<BibleButton[]> => {
  try {
    // Since the biblia_buttons table doesn't exist, let's return mock data
    // This will allow the app to function until the database table is created
    console.log('Providing mock Bible buttons data');
    
    // Mock data that matches the BibleButton interface
    const mockButtons: BibleButton[] = [
      {
        id: '1',
        button_name: 'Exegese',
        button_icon: 'BookOpen',
        prompt_ai: 'Faça uma exegese detalhada de {verses}.',
        slug: 'exegese',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        button_name: 'Aplicação',
        button_icon: 'Lightbulb',
        prompt_ai: 'Como aplicar {verses} na vida prática?',
        slug: 'aplicacao',
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        button_name: 'Estudo',
        button_icon: 'GraduationCap',
        prompt_ai: 'Faça um estudo bíblico sobre {verses}.',
        slug: 'estudo',
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        button_name: 'Copiar',
        button_icon: 'Copy',
        prompt_ai: 'Copie o texto de {verses}.',
        slug: 'copiar',
        created_at: new Date().toISOString()
      }
    ];
    
    return mockButtons;
    
    /* 
    // This is the original code that would work if the biblia_buttons table existed
    // Keep it commented for future reference
    const { data, error } = await supabase
      .from('biblia_buttons')
      .select('*')
      .order('order_buttons', { ascending: true });
    
    if (error) {
      console.error('Error fetching bible buttons:', error);
      return [];
    }
    
    // Verificando se temos dados antes de tentar mapeá-los
    if (!data || data.length === 0) {
      return [];
    }

    // Convertendo explicitamente os dados para o formato BibleButton
    return data.map(item => ({
      id: item.id?.toString() || '',
      button_name: item.button_name || '',
      button_icon: item.button_icon || '',
      prompt_ai: item.prompt_ai || '',
      slug: item.slug || '',
      created_at: item.created_at || ''
    }));
    */
  } catch (err) {
    console.error('Unexpected error fetching bible buttons:', err);
    return [];
  }
};
