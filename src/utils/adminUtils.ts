
import { supabase } from '@/integrations/supabase/client';

export async function makeCurrentUserAdmin() {
  // Obter a sessão atual do usuário
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    throw new Error('Nenhum usuário logado');
  }

  // Inserir o papel de administrador para o usuário atual
  const { data, error } = await supabase
    .from('user_roles')
    .insert({ 
      user_id: session.user.id, 
      role: 'admin' 
    });

  if (error) {
    console.error('Erro ao definir usuário como admin:', error);
    throw error;
  }

  return true;
}
