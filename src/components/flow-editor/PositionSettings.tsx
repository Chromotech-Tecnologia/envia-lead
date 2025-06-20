
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye } from 'lucide-react';
import { useState } from 'react';
import PositionPreviewModal from './PositionPreviewModal';

interface PositionSettingsProps {
  flowData: any;
  setFlowData: (data: any) => void;
}

const PositionSettings = ({ flowData, setFlowData }: PositionSettingsProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const buttonPositions = [
    { value: 'bottom-right', label: 'Inferior Direito', icon: '↘️' },
    { value: 'bottom-left', label: 'Inferior Esquerdo', icon: '↙️' },
    { value: 'top-right', label: 'Superior Direito', icon: '↗️' },
    { value: 'top-left', label: 'Superior Esquerdo', icon: '↖️' },
    { value: 'center-right', label: 'Centro Direito', icon: '➡️' },
    { value: 'center-left', label: 'Centro Esquerdo', icon: '⬅️' }
  ];

  const chatPositions = [
    { value: 'bottom-right', label: 'Inferior Direito', icon: '↘️' },
    { value: 'bottom-left', label: 'Inferior Esquerdo', icon: '↙️' },
    { value: 'center', label: 'Centro', icon: '🎯' }
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Posicionamento</CardTitle>
              <CardDescription>
                Configure onde o botão e a janela do chat aparecerão
              </CardDescription>
            </div>
            <Button onClick={() => setIsPreviewOpen(true)} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Personalizar Visual
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium">Posição do Botão Flutuante</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
              {buttonPositions.map(position => (
                <Button
                  key={position.value}
                  variant={flowData.buttonPosition === position.value ? "default" : "outline"}
                  onClick={() => setFlowData(prev => ({...prev, buttonPosition: position.value}))}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  <span className="text-lg">{position.icon}</span>
                  <span className="text-xs text-center">{position.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-medium">Posição da Janela do Chat</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
              {chatPositions.map(position => (
                <Button
                  key={position.value}
                  variant={flowData.chatPosition === position.value ? "default" : "outline"}
                  onClick={() => setFlowData(prev => ({...prev, chatPosition: position.value}))}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                >
                  <span className="text-lg">{position.icon}</span>
                  <span className="text-xs text-center">{position.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {isPreviewOpen && (
        <PositionPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          flowData={flowData}
        />
      )}
    </>
  );
};

export default PositionSettings;
