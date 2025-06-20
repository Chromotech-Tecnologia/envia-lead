
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette, Eye } from 'lucide-react';
import { useState } from 'react';
import ChatPreviewModal from "@/components/ChatPreviewModal";

interface DesignSettingsProps {
  flowData: any;
  setFlowData: (data: any) => void;
}

const DesignSettings = ({ flowData, setFlowData }: DesignSettingsProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
    { value: 'center', label: 'Centro' }
  ];

  const openPreview = () => {
    setIsPreviewOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Configurações Visuais</CardTitle>
              <Button onClick={openPreview} variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Personalizar Visual
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cores */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Cores do Chat
              </h3>
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
            </div>

            {/* Avatar */}
            <div>
              <Label htmlFor="avatar">URL do Avatar do Atendente</Label>
              <Input
                id="avatar"
                value={flowData.avatar || ''}
                onChange={(e) => setFlowData(prev => ({...prev, avatar: e.target.value}))}
                placeholder="https://exemplo.com/avatar.jpg"
              />
            </div>

            {/* Mensagem de Saudação */}
            <div>
              <Label htmlFor="welcomeMessage">Mensagem de Saudação</Label>
              <Textarea
                id="welcomeMessage"
                value={flowData.welcomeMessage || 'Olá! Como posso ajudá-lo?'}
                onChange={(e) => setFlowData(prev => ({...prev, welcomeMessage: e.target.value}))}
                placeholder="Digite a mensagem que aparecerá junto ao botão flutuante"
              />
              <p className="text-xs text-gray-500 mt-1">
                Esta mensagem aparecerá junto ao botão flutuante e poderá ser fechada pelo usuário
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Posicionamento</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle>Configurações Finais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

      {isPreviewOpen && (
        <ChatPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          flowData={flowData}
          device="desktop"
        />
      )}
    </>
  );
};

export default DesignSettings;
