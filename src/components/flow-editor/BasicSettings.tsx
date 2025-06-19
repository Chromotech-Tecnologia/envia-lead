
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BasicSettingsProps {
  flowData: any;
  setFlowData: (data: any) => void;
}

const BasicSettings = ({ flowData, setFlowData }: BasicSettingsProps) => {
  const buttonPositionOptions = [
    { value: 'bottom-right', label: 'Inferior Direito' },
    { value: 'bottom-left', label: 'Inferior Esquerdo' },
    { value: 'top-right', label: 'Superior Direito' },
    { value: 'top-left', label: 'Superior Esquerdo' },
    { value: 'center-right', label: 'Centro Direito' },
    { value: 'center-left', label: 'Centro Esquerdo' }
  ];

  const chatPositionOptions = [
    { value: 'bottom-right', label: 'Inferior Direito' },
    { value: 'bottom-left', label: 'Inferior Esquerdo' },
    { value: 'top-right', label: 'Superior Direito' },
    { value: 'top-left', label: 'Superior Esquerdo' },
    { value: 'center-right', label: 'Centro Direito' },
    { value: 'center-left', label: 'Centro Esquerdo' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Fluxo</Label>
              <Input
                id="name"
                value={flowData.name}
                onChange={(e) => setFlowData(prev => ({...prev, name: e.target.value}))}
                placeholder="Ex: Captação de Leads - Produtos"
              />
            </div>
            
            <div>
              <Label htmlFor="minimumQuestion">Número Mínimo de Perguntas</Label>
              <Input
                id="minimumQuestion"
                type="number"
                min="1"
                value={flowData.minimumQuestion || 1}
                onChange={(e) => setFlowData(prev => ({...prev, minimumQuestion: parseInt(e.target.value) || 1}))}
                placeholder="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Quantidade mínima de perguntas respondidas para considerar um lead válido
              </p>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={flowData.description}
              onChange={(e) => setFlowData(prev => ({...prev, description: e.target.value}))}
              placeholder="Descreva o objetivo deste fluxo..."
            />
          </div>

          <div>
            <Label htmlFor="whatsapp">Número do WhatsApp</Label>
            <Input
              id="whatsapp"
              value={flowData.whatsapp}
              onChange={(e) => setFlowData(prev => ({...prev, whatsapp: e.target.value}))}
              placeholder="Ex: 5511999999999"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Posicionamento do Chat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buttonPosition">Posição do Botão Flutuante</Label>
              <Select 
                value={flowData.buttonPosition || flowData.position || 'bottom-right'} 
                onValueChange={(value) => setFlowData(prev => ({...prev, buttonPosition: value}))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {buttonPositionOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="chatPosition">Posição do Chat Aberto</Label>
              <Select 
                value={flowData.chatPosition || 'bottom-right'} 
                onValueChange={(value) => setFlowData(prev => ({...prev, chatPosition: value}))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chatPositionOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BasicSettings;
