
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, MessageCircle } from 'lucide-react';
import QuestionCard from './QuestionCard';

interface QuestionDragDropProps {
  flowData: any;
  setFlowData: (data: any) => void;
}

const QuestionDragDrop = ({ flowData, setFlowData }: QuestionDragDropProps) => {
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);

  const questions = flowData.questions || [];

  const addQuestion = (type: string) => {
    const newQuestion = {
      id: Date.now(),
      type,
      title: type === 'bot_message' ? 'Nova mensagem do bot' : 'Nova pergunta',
      placeholder: type === 'bot_message' ? '' : 'Digite sua resposta...',
      required: type !== 'bot_message',
      order: questions.length,
      options: type === 'select' || type === 'radio' ? ['Opção 1', 'Opção 2'] : []
    };
    
    setFlowData(prev => ({
      ...prev,
      questions: [...questions, newQuestion]
    }));
    
    // Abrir em modo de edição automaticamente
    setEditingQuestion(newQuestion.id);
  };

  const updateQuestion = (id: number, updates: any) => {
    setFlowData(prev => ({
      ...prev,
      questions: questions.map(q => q.id === id ? { ...q, ...updates } : q)
    }));
  };

  const deleteQuestion = (id: number) => {
    setFlowData(prev => ({
      ...prev,
      questions: questions.filter(q => q.id !== id)
    }));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Atualizar ordem
    const updatedQuestions = items.map((item, index) => ({
      ...item,
      order: index
    }));

    setFlowData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  return (
    <div className="space-y-6">
      {/* Mensagem de Saudação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Mensagem de Saudação
          </CardTitle>
          <CardDescription>
            Configure a mensagem inicial que aparecerá para o usuário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="welcomeMessage">Mensagem de Boas-vindas</Label>
            <Textarea
              id="welcomeMessage"
              value={flowData.welcomeMessage || 'Olá! Como posso ajudá-lo?'}
              onChange={(e) => setFlowData(prev => ({...prev, welcomeMessage: e.target.value}))}
              placeholder="Ex: Olá! Bem-vindo ao nosso atendimento. Como posso ajudá-lo hoje?"
              className="min-h-[80px]"
            />
            <p className="text-sm text-gray-500 mt-1">
              Esta mensagem aparecerá na bolha de boas-vindas e como primeira mensagem do chat
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Perguntas */}
      <Card>
        <CardHeader>
          <CardTitle>Perguntas do Fluxo</CardTitle>
          <CardDescription>
            Configure as perguntas que serão feitas aos usuários. Arraste para reordenar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => addQuestion('text')} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Texto
            </Button>
            <Button onClick={() => addQuestion('email')} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Email
            </Button>
            <Button onClick={() => addQuestion('phone')} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Telefone
            </Button>
            <Button onClick={() => addQuestion('select')} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Seleção
            </Button>
            <Button onClick={() => addQuestion('radio')} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Múltipla Escolha
            </Button>
            <Button onClick={() => addQuestion('bot_message')} variant="outline" size="sm" className="bg-blue-50 text-blue-700 border-blue-200">
              <Plus className="w-4 h-4 mr-1" />
              Mensagem Bot
            </Button>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma pergunta adicionada ainda.</p>
              <p className="text-sm">Use os botões acima para adicionar perguntas.</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="questions">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {questions
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((question, index) => (
                        <Draggable
                          key={question.id}
                          draggableId={question.id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={snapshot.isDragging ? "opacity-70" : ""}
                            >
                              <QuestionCard
                                question={question}
                                index={index + 1}
                                isEditing={editingQuestion === question.id}
                                onEdit={() => setEditingQuestion(question.id)}
                                onSave={() => setEditingQuestion(null)}
                                onDelete={() => deleteQuestion(question.id)}
                                onUpdate={(updates) => updateQuestion(question.id, updates)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionDragDrop;
