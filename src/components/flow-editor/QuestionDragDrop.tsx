
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Type, 
  Mail, 
  Phone, 
  Hash,
  List,
  CheckSquare
} from 'lucide-react';

interface Question {
  id: number;
  type: 'text' | 'email' | 'phone' | 'number' | 'single' | 'multiple';
  title: string;
  placeholder: string;
  required: boolean;
  order: number;
  options?: string[];
}

interface QuestionDragDropProps {
  flowData: any;
  setFlowData: (data: any) => void;
}

const QuestionDragDrop = ({ flowData, setFlowData }: QuestionDragDropProps) => {
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);

  const questionTypes = [
    { value: 'text', label: 'Texto', icon: Type },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'phone', label: 'Telefone', icon: Phone },
    { value: 'number', label: 'Número', icon: Hash },
    { value: 'single', label: 'Escolha Única', icon: List },
    { value: 'multiple', label: 'Múltipla Escolha', icon: CheckSquare }
  ];

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(flowData.questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedQuestions = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setFlowData({
      ...flowData,
      questions: updatedQuestions
    });
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now(),
      type: 'text',
      title: 'Nova Pergunta',
      placeholder: 'Digite aqui...',
      required: false,
      order: flowData.questions.length + 1
    };

    setFlowData({
      ...flowData,
      questions: [...flowData.questions, newQuestion]
    });
  };

  const updateQuestion = (id: number, updates: Partial<Question>) => {
    const updatedQuestions = flowData.questions.map((q: Question) =>
      q.id === id ? { ...q, ...updates } : q
    );

    setFlowData({
      ...flowData,
      questions: updatedQuestions
    });
  };

  const deleteQuestion = (id: number) => {
    const updatedQuestions = flowData.questions
      .filter((q: Question) => q.id !== id)
      .map((q: Question, index: number) => ({ ...q, order: index + 1 }));

    setFlowData({
      ...flowData,
      questions: updatedQuestions
    });
  };

  const getQuestionIcon = (type: string) => {
    const questionType = questionTypes.find(t => t.value === type);
    return questionType ? questionType.icon : Type;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perguntas do Fluxo</CardTitle>
        <CardDescription>
          Arraste e solte para reordenar as perguntas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="questions">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {flowData.questions.map((question: Question, index: number) => (
                  <Draggable key={question.id} draggableId={question.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-white border rounded-lg p-4 transition-shadow ${
                          snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            {...provided.dragHandleProps}
                            className="mt-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="w-5 h-5" />
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const Icon = getQuestionIcon(question.type);
                                  return <Icon className="w-4 h-4 text-purple-600" />;
                                })()}
                                <Badge variant="secondary">
                                  {questionTypes.find(t => t.value === question.type)?.label}
                                </Badge>
                                <span className="text-xs text-gray-500">#{question.order}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingQuestion(editingQuestion === question.id ? null : question.id)}
                                >
                                  {editingQuestion === question.id ? 'Fechar' : 'Editar'}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteQuestion(question.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium">{question.title}</h4>
                              <p className="text-sm text-gray-500">{question.placeholder}</p>
                              {question.required && (
                                <span className="text-xs text-red-500">* Obrigatório</span>
                              )}
                            </div>

                            {editingQuestion === question.id && (
                              <div className="space-y-4 pt-4 border-t">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Tipo da Pergunta</Label>
                                    <Select
                                      value={question.type}
                                      onValueChange={(value) => updateQuestion(question.id, { type: value as Question['type'] })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {questionTypes.map((type) => (
                                          <SelectItem key={type.value} value={type.value}>
                                            <div className="flex items-center gap-2">
                                              <type.icon className="w-4 h-4" />
                                              {type.label}
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={question.required}
                                      onCheckedChange={(checked) => updateQuestion(question.id, { required: checked })}
                                    />
                                    <Label>Obrigatório</Label>
                                  </div>
                                </div>

                                <div>
                                  <Label>Título da Pergunta</Label>
                                  <Input
                                    value={question.title}
                                    onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
                                    placeholder="Ex: Qual é o seu nome?"
                                  />
                                </div>

                                <div>
                                  <Label>Placeholder</Label>
                                  <Input
                                    value={question.placeholder}
                                    onChange={(e) => updateQuestion(question.id, { placeholder: e.target.value })}
                                    placeholder="Ex: Digite seu nome completo"
                                  />
                                </div>

                                {(question.type === 'single' || question.type === 'multiple') && (
                                  <div>
                                    <Label>Opções (uma por linha)</Label>
                                    <Textarea
                                      value={question.options?.join('\n') || ''}
                                      onChange={(e) => updateQuestion(question.id, { 
                                        options: e.target.value.split('\n').filter(option => option.trim())
                                      })}
                                      placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                                      rows={4}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <Button onClick={addQuestion} className="w-full" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Pergunta
        </Button>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <Label className="font-medium">Configuração de Envio</Label>
          <div className="mt-2">
            <Label className="text-sm text-gray-600">
              Número mínimo de perguntas respondidas para envio:
            </Label>
            <Select
              value={flowData.minimumQuestion.toString()}
              onValueChange={(value) => setFlowData({
                ...flowData,
                minimumQuestion: parseInt(value)
              })}
            >
              <SelectTrigger className="w-32 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: flowData.questions.length }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionDragDrop;
