
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BasicSettingsProps {
  flowData: any;
  setFlowData: (data: any) => void;
}

const BasicSettings = ({ flowData, setFlowData }: BasicSettingsProps) => {
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
    </div>
  );
};

export default BasicSettings;
