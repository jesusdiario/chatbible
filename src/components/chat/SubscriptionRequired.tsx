
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubscriptionRequiredProps {
  startCheckout: (priceId: string) => void;
}

const SubscriptionRequired: React.FC<SubscriptionRequiredProps> = ({ startCheckout }) => {
  const navigate = useNavigate();
  
  const handleUpgradeClick = () => {
    startCheckout('price_1OeVptLyyMwTutR9oFF1m3aC'); // Premium plan price ID
  };

  return (
    <div className="pt-20 h-full flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="mb-4 p-3 rounded-full bg-amber-100 inline-flex">
          <Lock className="h-6 w-6 text-amber-600" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Conteúdo Premium</h2>
        <p className="text-gray-600 mb-6">
          Esta conversa contém mais de 50 mensagens e só está disponível para assinantes do plano Premium.
        </p>
        <Button onClick={handleUpgradeClick} className="w-full">
          Fazer upgrade para Premium
        </Button>
        <div className="mt-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/history')}
          >
            Voltar para o histórico
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionRequired;
