
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Settings } from 'lucide-react';

interface BasicSettingsProps {
  flowData: any;
  setFlowData: (data: any) => void;
}

const BasicSettings = ({ flowData, setFlowData }: BasicSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configurações Básicas
        </CardTitle>
        <CardDescription>
          Configure as informações básicas do seu fluxo de conversação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome do Fluxo</Label>
            <Input
              id="name"
              value={flowData.name}
              onChange={(e) => setFlowData(prev => ({...prev, name: e.target.value}))}
              placeholder="Ex: Captação de Leads - Site Principal"
            />
          </div>
          
          <div>
            <Label htmlFor="whatsapp">Número do WhatsApp</Label>
            <Input
              id="whatsapp"
              value={flowData.whatsapp || ''}
              onChange={(e) => setFlowData(prev => ({...prev, whatsapp: e.target.value}))}
              placeholder="Ex: 11999999999"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isActive">Status do Fluxo</Label>
              <p className="text-sm text-gray-500">
                Ativar ou desativar este fluxo
              </p>
            </div>
            <Switch
              id="isActive"
              checked={flowData.is_active !== false}
              onCheckedChange={(checked) => setFlowData(prev => ({...prev, is_active: checked}))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={flowData.description || ''}
            onChange={(e) => setFlowData(prev => ({...prev, description: e.target.value}))}
            placeholder="Descreva o objetivo deste fluxo..."
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="minimumQuestion">Mínimo de Perguntas para Lead</Label>
            <Input
              id="minimumQuestion"
              type="number"
              min="1"
              value={flowData.minimumQuestion || 1}
              onChange={(e) => setFlowData(prev => ({...prev, minimumQuestion: parseInt(e.target.value) || 1}))}
            />
            <p className="text-sm text-gray-500 mt-1">
              Número mínimo de perguntas que o usuário deve responder para ser considerado um lead válido
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showWhatsappButton">Botão do WhatsApp</Label>
              <p className="text-sm text-gray-500">
                Mostrar botão para continuar conversa no WhatsApp ao final do chat
              </p>
            </div>
            <Switch
              id="showWhatsappButton"
              checked={flowData.showWhatsappButton !== false}
              onCheckedChange={(checked) => setFlowData(prev => ({...prev, showWhatsappButton: checked}))}
            />
          </div>
        </div>

        {/* Configurações Finais */}
        <div className="space-y-4 pt-6 border-t">
          <h3 className="text-lg font-medium">Configurações Finais</h3>
          
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
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicSettings;
