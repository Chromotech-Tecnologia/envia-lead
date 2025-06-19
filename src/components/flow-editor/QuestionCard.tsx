
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GripVertical,
  Trash2,
  Plus,
  Type,
  CheckSquare,
  Circle,
  Mail,
  Phone,
  Hash
} from 'lucide-react';

interface QuestionCardProps {
  question: any;
  index: number;
  updateQuestion: (id: number, field: string, value: any) => void;
  removeQuestion: (id: number) => void;
}

const QuestionCard = ({ question, index, updateQuestion, removeQuestion }: QuestionCardProps) => {
  const questionTypes = [
    { value: 'text', label: 'Texto Livre', icon: Type },
    { value: 'multiple', label: 'Múltipla Escolha', icon: CheckSquare },
    { value: 'single', label: 'Escolha Única', icon: Circle },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'phone', label: 'Telefone', icon: Phone },
    { value: 'number', label: 'Número', icon: Hash }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
            <Badge variant="outline">Pergunta {index + 1}</Badge>
            <span className="font-medium">{question.title}</span>
          </div>
          <div className="flex items-center gap-2">
            {question.required && (
              <Badge variant="secondary">Obrigatória</Badge>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => removeQuestion(question.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Tipo de Pergunta</Label>
            <Select 
              value={question.type} 
              onValueChange={(value) => updateQuestion(question.id, 'type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {questionTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2 pt-6">
            <Switch 
              id={`required-${question.id}`}
              checked={question.required}
              onCheckedChange={(checked) => updateQuestion(question.id, 'required', checked)}
            />
            <Label htmlFor={`required-${question.id}`}>Obrigatória</Label>
          </div>
        </div>
        
        <div>
          <Label>Título da Pergunta</Label>
          <Input
            value={question.title}
            onChange={(e) => updateQuestion(question.id, 'title', e.target.value)}
            placeholder="Ex: Qual é o seu nome?"
          />
        </div>
        
        {(question.type === 'text' || question.type === 'email') && (
          <div>
            <Label>Placeholder</Label>
            <Input
              value={question.placeholder || ''}
              onChange={(e) => updateQuestion(question.id, 'placeholder', e.target.value)}
              placeholder="Texto de exemplo para o usuário"
            />
          </div>
        )}
        
        {(question.type === 'multiple' || question.type === 'single') && (
          <div>
            <Label>Opções</Label>
            <div className="space-y-2">
              {(question.options || []).map((option, optIndex) => (
                <div key={optIndex} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])];
                      newOptions[optIndex] = e.target.value;
                      updateQuestion(question.id, 'options', newOptions);
                    }}
                    placeholder={`Opção ${optIndex + 1}`}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const newOptions = (question.options || []).filter((_, i) => i !== optIndex);
                      updateQuestion(question.id, 'options', newOptions);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const newOptions = [...(question.options || []), ''];
                  updateQuestion(question.id, 'options', newOptions);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Opção
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
