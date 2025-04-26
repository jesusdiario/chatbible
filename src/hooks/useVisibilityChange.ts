
import { useEffect, useRef } from 'react';

type VisibilityCallback = () => void;

export const useVisibilityChange = (onVisibilityChange: VisibilityCallback) => {
  const visibilityTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      // Limpar qualquer timeout pendente
      if (visibilityTimeoutRef.current !== null) {
        window.clearTimeout(visibilityTimeoutRef.current);
      }

      // Se a página voltar a ficar visível, aguarde um pequeno intervalo
      // antes de atualizar para evitar múltiplas atualizações
      if (document.visibilityState === 'visible') {
        visibilityTimeoutRef.current = window.setTimeout(() => {
          onVisibilityChange();
          visibilityTimeoutRef.current = null;
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (visibilityTimeoutRef.current !== null) {
        window.clearTimeout(visibilityTimeoutRef.current);
      }
    };
  }, [onVisibilityChange]);
};
