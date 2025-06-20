
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, Trash2, GripVertical, Plus, X, MessageSquare } from 'lucide-react';

interface QuestionCardProps {
  question: any;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onUpdate: (updates: any) => void;
}

const QuestionCard = ({ question, index, isEditing, onEdit, onSave, onDelete, onUpdate }: QuestionCardProps) => {
  const [localQuestion, setLocalQuestion] = useState(question);

  const handleSave = () => {
    onUpdate(localQuestion);
    onSave();
  };

  const addOption = () => {
    const newOptions = [...(localQuestion.options || []), `Opção ${(localQuestion.options?.length || 0) + 1}`];
    setLocalQuestion({ ...localQuestion, options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(localQuestion.options || [])];
    newOptions[index] = value;
    setLocalQuestion({ ...localQuestion, options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = localQuestion.options?.filter((_, i) => i !== index) || [];
    setLocalQuestion({ ...localQuestion, options: newOptions });
  };

  const getTypeLabel = (type: string) => {
    const types = {
      text: 'Texto',
      email: 'Email',
      phone: 'Telefone',
      select: 'Seleção',
      radio: 'Múltipla Escolha',
      bot_message: 'Mensagem Bot'
    };
    return types[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      text: 'bg-blue-100 text-blue-800',
      email: 'bg-green-100 text-green-800',
      phone: 'bg-purple-100 text-purple-800',
      select: 'bg-orange-100 text-orange-800',
      radio: 'bg-pink-100 text-pink-800',
      bot_message: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (isEditing) {
    return (
      <Card className="border-2 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <Badge className={getTypeColor(localQuestion.type)}>
              {localQuestion.type === 'bot_message' ? <MessageSquare className="w-3 h-3 mr-1" /> : null}
              {getTypeLabel(localQuestion.type)}
            </Badge>
            <span className="text-sm text-gray-500">#{index}</span>
          </div>

          <div className="space-y-4">
            <div>
              <Label>
                {localQuestion.type === 'bot_message' ? 'Mensagem' : 'Pergunta'}
              </Label>
              <Textarea
                value={localQuestion.title}
                onChange={(e) => setLocalQuestion({ ...localQuestion, title: e.target.value })}
                placeholder={localQuestion.type === 'bot_message' ? 'Digite a mensagem que será exibida...' : 'Digite sua pergunta...'}
                className="min-h-[80px]"
              />
            </div>

            {localQuestion.type !== 'bot_message' && (
              <>
                <div>
                  <Label>Placeholder</Label>
                  <Input
                    value={localQuestion.placeholder || ''}
                    onChange={(e) => setLocalQuestion({ ...localQuestion, placeholder: e.target.value })}
                    placeholder="Ex: Digite seu nome completo..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={localQuestion.required}
                    onCheckedChange={(checked) => setLocalQuestion({ ...localQuestion, required: checked })}
                  />
                  <Label>Campo obrigatório</Label>
                </div>
              </>
            )}

            {(localQuestion.type === 'select' || localQuestion.type === 'radio') && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Opções</Label>
                  <Button onClick={addOption} size="sm" variant="outline">
                    <Plus className="w-3 h-3 mr-1" />
                    Adicionar
                  </Button>
                </div>
                <div className="space-y-2">
                  {(localQuestion.options || []).map((option, optIndex) => (
                    <div key={optIndex} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(optIndex, e.target.value)}
                        placeholder={`Opção ${optIndex + 1}`}
                      />
                      <Button
                        onClick={() => removeOption(optIndex)}
                        size="sm"
                        variant="outline"
                        className="px-2"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} size="sm">
                <Save className="w-3 h-3 mr-1" />
                Salvar
              </Button>
              <Button onClick={onSave} variant="outline" size="sm">
                Cancelar
              </Button>
              <Button onClick={onDelete} variant="destructive" size="sm" className="ml-auto">
                <Trash2 className="w-3 h-3 mr-1" />
                Excluir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <GripVertical className="w-4 h-4 text-gray-400 mt-1 cursor-grab" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getTypeColor(question.type)}>
                {question.type === 'bot_message' ? <MessageSquare className="w-3 h-3 mr-1" /> : null}
                {getTypeLabel(question.type)}
              </Badge>
              <span className="text-sm text-gray-500">#{index}</span>
              {question.required && question.type !== 'bot_message' && (
                <Badge variant="outline" className="text-xs">Obrigatório</Badge>
              )}
            </div>
            
            <p className="text-sm font-medium text-gray-900 mb-1">
              {question.title}
            </p>
            
            {question.placeholder && question.type !== 'bot_message' && (
              <p className="text-xs text-gray-500 mb-2">
                Placeholder: {question.placeholder}
              </p>
            )}
            
            {(question.type === 'select' || question.type === 'radio') && question.options && (
              <div className="text-xs text-gray-500">
                Opções: {question.options.join(', ')}
              </div>
            )}
          </div>

          <div className="flex gap-1">
            <Button onClick={onEdit} size="sm" variant="outline">
              <Edit className="w-3 h-3" />
            </Button>
            <Button onClick={onDelete} size="sm" variant="outline" className="text-red-600 hover:text-red-700">
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
