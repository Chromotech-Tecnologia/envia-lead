
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from 'lucide-react';
import QuestionCard from './QuestionCard';

interface QuestionEditorProps {
  flowData: any;
  setFlowData: (data: any) => void;
}

const QuestionEditor = ({ flowData, setFlowData }: QuestionEditorProps) => {
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: 'text',
      title: 'Nova pergunta',
      placeholder: '',
      required: false,
      order: flowData.questions.length + 1,
      options: []
    };
    setFlowData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const removeQuestion = (id: number) => {
    setFlowData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  const updateQuestion = (id: number, field: string, value: any) => {
    setFlowData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Editor de Perguntas</CardTitle>
              <CardDescription>
                Configure as perguntas do seu fluxo de conversa
              </CardDescription>
            </div>
            <Button onClick={addQuestion}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Pergunta
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="minimumQuestion">Pergunta Mínima para Envio</Label>
            <Select 
              value={flowData.minimumQuestion.toString()} 
              onValueChange={(value) => setFlowData(prev => ({...prev, minimumQuestion: parseInt(value)}))}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {flowData.questions.map((_, index) => (
                  <SelectItem key={index} value={(index + 1).toString()}>
                    Pergunta {index + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600 mt-1">
              Leads que responderem até esta pergunta serão enviados mesmo que não concluam o fluxo
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {flowData.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            updateQuestion={updateQuestion}
            removeQuestion={removeQuestion}
          />
        ))}
      </div>
    </div>
  );
};

export default QuestionEditor;
