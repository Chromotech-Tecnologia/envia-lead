
import { MessageCircle } from 'lucide-react';

const EmptyQuestionsState = () => {
  return (
    <div className="text-center py-8 text-gray-500">
      <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p>Nenhuma pergunta adicionada ainda.</p>
      <p className="text-sm">Use os botões acima para adicionar perguntas.</p>
    </div>
  );
};

export default EmptyQuestionsState;
