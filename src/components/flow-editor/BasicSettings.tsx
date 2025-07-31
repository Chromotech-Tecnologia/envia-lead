
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
              checked={Boolean(flowData.is_active)}
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

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="showWhatsappButton">Botão do WhatsApp</Label>
            <p className="text-sm text-gray-500">
              Mostrar botão para continuar conversa no WhatsApp ao final do chat
            </p>
          </div>
          <Switch
            id="showWhatsappButton"
            checked={Boolean(flowData.show_whatsapp_button)}
            onCheckedChange={(checked) => setFlowData(prev => ({...prev, show_whatsapp_button: checked}))}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicSettings;
