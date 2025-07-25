import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { Eye } from 'lucide-react';
import PositionPreviewModal from './PositionPreviewModal';

interface PositionSettingsProps {
  flowData: any;
  setFlowData: (data: any) => void;
}

const PositionSettings = ({ flowData, setFlowData }: PositionSettingsProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const positionOptions = [
    { value: 'top-left', label: 'Superior Esquerdo', gridPos: 'row-start-1 col-start-1' },
    { value: 'top-center', label: 'Superior Centro', gridPos: 'row-start-1 col-start-2' },
    { value: 'top-right', label: 'Superior Direito', gridPos: 'row-start-1 col-start-3' },
    { value: 'center-left', label: 'Centro Esquerdo', gridPos: 'row-start-2 col-start-1' },
    { value: 'center-center', label: 'Centro', gridPos: 'row-start-2 col-start-2' },
    { value: 'center-right', label: 'Centro Direito', gridPos: 'row-start-2 col-start-3' },
    { value: 'bottom-left', label: 'Inferior Esquerdo', gridPos: 'row-start-3 col-start-1' },
    { value: 'bottom-center', label: 'Inferior Centro', gridPos: 'row-start-3 col-start-2' },
    { value: 'bottom-right', label: 'Inferior Direito', gridPos: 'row-start-3 col-start-3' },
  ];

  const updateButtonPosition = (position: string) => {
    setFlowData({ ...flowData, button_position: position });
  };

  const updateChatPosition = (position: string) => {
    setFlowData({ ...flowData, chat_position: position });
  };

  const updateButtonOffset = (axis: 'x' | 'y', value: number) => {
    const key = `button_offset_${axis}`;
    setFlowData({ ...flowData, [key]: value });
  };

  const updateChatOffset = (axis: 'x' | 'y', value: number) => {
    const key = `chat_offset_${axis}`;
    setFlowData({ ...flowData, [key]: value });
  };

  const updateDimensions = (key: string, value: number) => {
    setFlowData({ ...flowData, [key]: value });
  };

  const PositionGrid = ({ currentValue, onSelect, title }: { currentValue: string; onSelect: (value: string) => void; title: string }) => (
    <div className="space-y-3">
      <Label className="text-base font-medium">{title}</Label>
      <div className="grid grid-cols-3 grid-rows-3 gap-2 p-4 bg-gray-50 rounded-lg">
        {positionOptions.map(position => (
          <Button
            key={position.value}
            variant={currentValue === position.value ? "default" : "outline"}
            onClick={() => onSelect(position.value)}
            className={`h-12 text-xs ${position.gridPos} relative`}
            size="sm"
          >
            <div className="text-center">
              <div className="text-lg mb-1">
                {position.value.includes('top') && '⬆️'}
                {position.value.includes('center') && position.value.includes('left') && '⬅️'}
                {position.value.includes('center') && position.value.includes('right') && '➡️'}
                {position.value.includes('center') && position.value.includes('center') && '🎯'}
                {position.value.includes('bottom') && '⬇️'}
              </div>
              <div className="text-xs leading-tight">{position.label}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Configurações de Posicionamento e Tamanho</CardTitle>
              <CardDescription>
                Configure a posição e tamanho do botão e janela do chat separadamente
              </CardDescription>
            </div>
            <Button onClick={() => setIsPreviewOpen(true)} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Visualizar Posições
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Configurações do Botão */}
          <div className="space-y-4">
            <h4 className="font-medium">Botão Flutuante</h4>
            <PositionGrid
              currentValue={flowData.button_position || 'bottom-right'}
              onSelect={updateButtonPosition}
              title="Posição do botão"
            />
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="button-offset-x">Horizontal</Label>
                <Input
                  id="button-offset-x"
                  type="number"
                  value={flowData.button_offset_x || 0}
                  onChange={(e) => updateButtonOffset('x', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="button-offset-y">Vertical</Label>
                <Input
                  id="button-offset-y"
                  type="number"
                  value={flowData.button_offset_y || 0}
                  onChange={(e) => updateButtonOffset('y', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="button-size">Tamanho</Label>
                <Input
                  id="button-size"
                  type="number"
                  value={flowData.button_size || 60}
                  onChange={(e) => updateDimensions('button_size', parseInt(e.target.value) || 60)}
                  placeholder="60"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Configurações do Chat */}
          <div className="space-y-4">
            <h4 className="font-medium">Janela do Chat</h4>
            <PositionGrid
              currentValue={flowData.chat_position || 'bottom-right'}
              onSelect={updateChatPosition}
              title="Posição da janela"
            />
            
            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label htmlFor="chat-offset-x">Horizontal</Label>
                <Input
                  id="chat-offset-x"
                  type="number"
                  value={flowData.chat_offset_x || 0}
                  onChange={(e) => updateChatOffset('x', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="chat-offset-y">Vertical</Label>
                <Input
                  id="chat-offset-y"
                  type="number"
                  value={flowData.chat_offset_y || 0}
                  onChange={(e) => updateChatOffset('y', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="chat-width">Largura</Label>
                <Input
                  id="chat-width"
                  type="number"
                  value={flowData.chat_width || 400}
                  onChange={(e) => updateDimensions('chat_width', parseInt(e.target.value) || 400)}
                  placeholder="400"
                />
              </div>
              <div>
                <Label htmlFor="chat-height">Altura</Label>
                <Input
                  id="chat-height"
                  type="number"
                  value={flowData.chat_height || 500}
                  onChange={(e) => updateDimensions('chat_height', parseInt(e.target.value) || 500)}
                  placeholder="500"
                />
              </div>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <strong>Dica:</strong> Use valores negativos para mover para esquerda/cima e positivos para direita/baixo.
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