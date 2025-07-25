import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle } from 'lucide-react';

interface QuestionConfigProps {
  flowData: any;
  setFlowData: (data: any) => void;
}

const QuestionConfig = ({ flowData, setFlowData }: QuestionConfigProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          Configurações de Perguntas
        </CardTitle>
        <CardDescription>
          Configure as regras e mensagens relacionadas às perguntas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="minimumQuestion">Mínimo de Perguntas para Lead</Label>
          <Input
            id="minimumQuestion"
            type="number"
            min="1"
            value={flowData.minimum_question || 1}
            onChange={(e) => setFlowData(prev => ({...prev, minimum_question: parseInt(e.target.value) || 1}))}
          />
          <p className="text-sm text-gray-500 mt-1">
            Número mínimo de perguntas que o usuário deve responder para ser considerado um lead válido
          </p>
        </div>

        <div>
          <Label htmlFor="finalMessage">Mensagem de Conclusão</Label>
          <Textarea
            id="finalMessage"
            value={flowData.final_message_custom || flowData.final_message || 'Obrigado pelo seu contato! Em breve entraremos em contato.'}
            onChange={(e) => setFlowData(prev => ({...prev, final_message_custom: e.target.value}))}
            placeholder="Mensagem exibida após completar o chat..."
            className="min-h-[60px]"
          />
          <p className="text-sm text-gray-500 mt-1">
            Esta mensagem será exibida no site quando o usuário completar o chat
          </p>
        </div>

        <div>
          <Label htmlFor="whatsappMessageTemplate">Texto para WhatsApp</Label>
          <Textarea
            id="whatsappMessageTemplate"
            value={flowData.whatsapp_message_template || 'Olá, meu nome é #nome e gostaria de mais informações.'}
            onChange={(e) => setFlowData(prev => ({...prev, whatsapp_message_template: e.target.value}))}
            placeholder="Use #nome, #telefone, #email para variáveis dinâmicas..."
            className="min-h-[60px]"
          />
          <p className="text-sm text-gray-500 mt-1">
            Use variáveis como #nome, #telefone, #email que serão substituídas pelas respostas do usuário
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionConfig;