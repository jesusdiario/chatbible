
import { useEffect, useRef } from 'react';

type VisibilityCallback = () => void;

export const useVisibilityChange = (onVisibilityChange: VisibilityCallback) => {
  const visibilityTimeoutRef = useRef<number | null>(null);
  const lastVisibilityState = useRef<string>(document.visibilityState);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const currentState = document.visibilityState;
      
      // Só executamos ações quando houver mudança real no estado de visibilidade
      if (currentState !== lastVisibilityState.current) {
        console.log(`Visibility changed from ${lastVisibilityState.current} to ${currentState}`);
        lastVisibilityState.current = currentState;
        
        // Limpar qualquer timeout pendente
        if (visibilityTimeoutRef.current !== null) {
          window.clearTimeout(visibilityTimeoutRef.current);
        }

        // Se a página voltar a ficar visível, aguarde um pequeno intervalo
        // antes de atualizar para evitar múltiplas atualizações
        if (currentState === 'visible') {
          visibilityTimeoutRef.current = window.setTimeout(() => {
            onVisibilityChange();
            visibilityTimeoutRef.current = null;
          }, 300); // reduzido para tornar a resposta mais rápida
        }
      }
    };

    // Verificar o estado inicial
    handleVisibilityChange();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (visibilityTimeoutRef.current !== null) {
        window.clearTimeout(visibilityTimeoutRef.current);
      }
    };
  }, [onVisibilityChange]);
};
