
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WelcomeMessageSettings from './WelcomeMessageSettings';
import QuestionTypeButtons from './QuestionTypeButtons';
import EmptyQuestionsState from './EmptyQuestionsState';
import QuestionsList from './QuestionsList';

interface QuestionDragDropProps {
  flowData: any;
  setFlowData: (data: any) => void;
}

const QuestionDragDrop = ({ flowData, setFlowData }: QuestionDragDropProps) => {
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);

  const questions = flowData?.questions || [];

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
    
    setFlowData((prev: any) => {
      const currentData = prev || {};
      return {
        ...currentData,
        questions: [...questions, newQuestion]
      };
    });
    
    setEditingQuestion(newQuestion.id);
  };

  const updateQuestion = (id: number, updates: any) => {
    setFlowData((prev: any) => {
      const currentData = prev || {};
      const updatedQuestions = questions.map(q => q.id === id ? { ...q, ...updates } : q);
      return {
        ...currentData,
        questions: updatedQuestions
      };
    });
  };

  const deleteQuestion = (id: number) => {
    setFlowData((prev: any) => {
      const currentData = prev || {};
      return {
        ...currentData,
        questions: questions.filter(q => q.id !== id)
      };
    });
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedQuestions = items.map((item, index) => ({
      ...item,
      order: index
    }));

    setFlowData((prev: any) => {
      const currentData = prev || {};
      return {
        ...currentData,
        questions: updatedQuestions
      };
    });
  };

  return (
    <div className="space-y-6">
      <WelcomeMessageSettings flowData={flowData} setFlowData={setFlowData} />

      <Card>
        <CardHeader>
          <CardTitle>Perguntas do Fluxo</CardTitle>
          <CardDescription>
            Configure as perguntas que serão feitas aos usuários. Arraste para reordenar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <QuestionTypeButtons onAddQuestion={addQuestion} />

          {questions.length === 0 ? (
            <EmptyQuestionsState />
          ) : (
            <QuestionsList
              questions={questions}
              editingQuestion={editingQuestion}
              onDragEnd={onDragEnd}
              onEditQuestion={setEditingQuestion}
              onSaveQuestion={() => setEditingQuestion(null)}
              onDeleteQuestion={deleteQuestion}
              onUpdateQuestion={updateQuestion}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionDragDrop;
