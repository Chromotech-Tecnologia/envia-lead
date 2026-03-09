
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import QuestionTypeButtons from './QuestionTypeButtons';
import EmptyQuestionsState from './EmptyQuestionsState';
import QuestionsList from './QuestionsList';

interface QuestionDragDropProps {
  flowData: any;
  setFlowData: (data: any) => void;
}

const QuestionDragDrop = ({ flowData, setFlowData }: QuestionDragDropProps) => {
  const [editingQuestion, setEditingQuestion] = useState<string | number | null>(null);

  const questions = flowData?.questions || [];

  const addQuestion = (type: string) => {
    const questionId = crypto.randomUUID();

    setFlowData((prev: any) => {
      const currentData = prev || {};
      const currentQuestions = currentData.questions || [];

      const newQuestion = {
        id: questionId,
        type,
        title: type === 'bot_message' ? 'Nova mensagem do bot' : 'Nova pergunta',
        placeholder: type === 'bot_message' ? '' : 'Digite sua resposta...',
        required: type !== 'bot_message',
        order: currentQuestions.length + 1,
        options: type === 'select' || type === 'radio' ? ['Opção 1', 'Opção 2'] : []
      };

      return {
        ...currentData,
        questions: [...currentQuestions, newQuestion]
      };
    });

    setEditingQuestion(questionId);
  };

  const updateQuestion = (id: string | number, updates: any) => {
    setFlowData((prev: any) => {
      const currentData = prev || {};
      const currentQuestions = currentData.questions || [];

      return {
        ...currentData,
        questions: currentQuestions.map((q: any) => q.id === id ? { ...q, ...updates } : q)
      };
    });
  };

  const deleteQuestion = (id: string | number) => {
    setFlowData((prev: any) => {
      const currentData = prev || {};
      const currentQuestions = currentData.questions || [];

      return {
        ...currentData,
        questions: currentQuestions.filter((q: any) => q.id !== id)
      };
    });
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedQuestions = items.map((item: any, index: number) => ({
      ...item,
      order: index + 1
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
