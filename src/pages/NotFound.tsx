
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mb-8 mt-4 text-lg text-gray-600">Página não encontrada</p>
      <Button onClick={() => navigate('/')}>
        Voltar para a página inicial
      </Button>
    </div>
  );
};

export default NotFound;
