
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Palette, Upload } from 'lucide-react';
import PositionSettings from './PositionSettings';

interface DesignSettingsProps {
  flowData: any;
  setFlowData: (data: any) => void;
}

const DesignSettings = ({ flowData, setFlowData }: DesignSettingsProps) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Por enquanto, usar URL temporária. Futuramente implementar upload real
      const tempUrl = URL.createObjectURL(file);
      setFlowData(prev => ({...prev, avatar: tempUrl}));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Cores do Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="primaryColor">Cor Primária</Label>
              <Input
                id="primaryColor"
                type="color"
                value={flowData.colors?.primary || '#FF6B35'}
                onChange={(e) => setFlowData(prev => ({
                  ...prev,
                  colors: { ...prev.colors, primary: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="secondaryColor">Cor Secundária</Label>
              <Input
                id="secondaryColor"
                type="color"
                value={flowData.colors?.secondary || '#3B82F6'}
                onChange={(e) => setFlowData(prev => ({
                  ...prev,
                  colors: { ...prev.colors, secondary: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="textColor">Cor do Texto</Label>
              <Input
                id="textColor"
                type="color"
                value={flowData.colors?.text || '#1F2937'}
                onChange={(e) => setFlowData(prev => ({
                  ...prev,
                  colors: { ...prev.colors, text: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="backgroundColor">Cor de Fundo</Label>
              <Input
                id="backgroundColor"
                type="color"
                value={flowData.colors?.background || '#FFFFFF'}
                onChange={(e) => setFlowData(prev => ({
                  ...prev,
                  colors: { ...prev.colors, background: e.target.value }
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avatar do Atendente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {flowData.avatar && (
                <img 
                  src={flowData.avatar} 
                  alt="Avatar" 
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Fazer Upload do Avatar
                    </span>
                  </Button>
                </Label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <PositionSettings flowData={flowData} setFlowData={setFlowData} />

      <Card>
        <CardHeader>
          <CardTitle>Configurações Finais</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignSettings;
