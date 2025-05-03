
import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Função para verificar o tamanho da tela e atualizar o estado
    function checkMobile() {
      setIsMobile(window.innerWidth < 768);
    }
    
    // Verificar inicialmente
    checkMobile();
    
    // Adicionar listener para mudanças de tamanho
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}
