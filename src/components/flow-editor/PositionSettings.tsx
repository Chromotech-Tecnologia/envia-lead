
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
              <CardTitle>Posicionamento</CardTitle>
              <CardDescription>
                Configure onde o botão e a janela do chat aparecerão independentemente
              </CardDescription>
            </div>
            <Button onClick={() => setIsPreviewOpen(true)} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Visualizar Posições
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <PositionGrid
            currentValue={flowData.position || 'bottom-right'}
            onSelect={(value) => setFlowData(prev => ({...prev, position: value}))}
            title="Posição do Botão Flutuante"
          />
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Dica de Posicionamento:</h4>
            <p className="text-sm text-blue-800">
              Quando o botão estiver nas bordas da tela, o chat abrirá automaticamente no lado oposto 
              para garantir total visibilidade e evitar cortes de conteúdo.
            </p>
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
