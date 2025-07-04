
import TestMenu from '@/components/TestMenu';

const Test = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Menu de Teste
        </h1>
        <p className="text-gray-600">
          Ferramenta para testar a integração do chat no site externo
        </p>
      </div>
      
      <TestMenu />
    </div>
  );
};

export default Test;
