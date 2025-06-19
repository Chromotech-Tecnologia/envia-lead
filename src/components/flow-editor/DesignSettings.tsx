
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette } from 'lucide-react';

interface DesignSettingsProps {
  flowData: any;
  setFlowData: (data: any) => void;
}

const DesignSettings = ({ flowData, setFlowData }: DesignSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Personalização Visual
        </CardTitle>
        <CardDescription>
          Configure as cores e aparência do chat
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Esquema de Cores</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label htmlFor="primary-color" className="text-sm">Cor Principal</Label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    id="primary-color"
                    value={flowData.colors.primary}
                    onChange={(e) => setFlowData(prev => ({
                      ...prev,
                      colors: { ...prev.colors, primary: e.target.value }
                    }))}
                    className="w-12 h-10 border rounded"
                  />
                  <Input 
                    value={flowData.colors.primary}
                    onChange={(e) => setFlowData(prev => ({
                      ...prev,
                      colors: { ...prev.colors, primary: e.target.value }
                    }))}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="background-color" className="text-sm">Cor de Fundo</Label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    id="background-color"
                    value={flowData.colors.background}
                    onChange={(e) => setFlowData(prev => ({
                      ...prev,
                      colors: { ...prev.colors, background: e.target.value }
                    }))}
                    className="w-12 h-10 border rounded"
                  />
                  <Input 
                    value={flowData.colors.background}
                    onChange={(e) => setFlowData(prev => ({
                      ...prev,
                      colors: { ...prev.colors, background: e.target.value }
                    }))}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <Label>Avatar do Atendente</Label>
            <Input
              value={flowData.avatar}
              onChange={(e) => setFlowData(prev => ({...prev, avatar: e.target.value}))}
              placeholder="URL da imagem do avatar"
              className="mt-2"
            />
            <p className="text-sm text-gray-600 mt-1">
              URL da imagem que aparecerá como avatar do atendente
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DesignSettings;
