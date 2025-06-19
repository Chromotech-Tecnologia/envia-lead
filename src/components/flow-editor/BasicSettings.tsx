
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
  const positionOptions = [
    { value: 'bottom-right', label: 'Inferior Direito' },
    { value: 'bottom-left', label: 'Inferior Esquerdo' },
    { value: 'center', label: 'Centro da Tela' },
    { value: 'top-center', label: 'Superior Centralizado' },
    { value: 'bottom-center', label: 'Inferior Centralizado' }
  ];

  return (
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
            <Label htmlFor="position">Posição na Tela</Label>
            <Select value={flowData.position} onValueChange={(value) => setFlowData(prev => ({...prev, position: value}))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {positionOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
  );
};

export default BasicSettings;
