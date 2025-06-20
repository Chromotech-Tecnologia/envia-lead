
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

interface QuestionTypeButtonsProps {
  onAddQuestion: (type: string) => void;
}

const QuestionTypeButtons = ({ onAddQuestion }: QuestionTypeButtonsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => onAddQuestion('text')} variant="outline" size="sm">
        <Plus className="w-4 h-4 mr-1" />
        Texto
      </Button>
      <Button onClick={() => onAddQuestion('email')} variant="outline" size="sm">
        <Plus className="w-4 h-4 mr-1" />
        Email
      </Button>
      <Button onClick={() => onAddQuestion('phone')} variant="outline" size="sm">
        <Plus className="w-4 h-4 mr-1" />
        Telefone
      </Button>
      <Button onClick={() => onAddQuestion('select')} variant="outline" size="sm">
        <Plus className="w-4 h-4 mr-1" />
        Seleção
      </Button>
      <Button onClick={() => onAddQuestion('radio')} variant="outline" size="sm">
        <Plus className="w-4 h-4 mr-1" />
        Múltipla Escolha
      </Button>
      <Button onClick={() => onAddQuestion('bot_message')} variant="outline" size="sm" className="bg-blue-50 text-blue-700 border-blue-200">
        <Plus className="w-4 h-4 mr-1" />
        Mensagem Bot
      </Button>
    </div>
  );
};

export default QuestionTypeButtons;
