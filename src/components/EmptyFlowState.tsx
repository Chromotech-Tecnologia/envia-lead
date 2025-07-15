import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

interface EmptyFlowStateProps {
  hasFlows: boolean;
  onCreateFlow: () => void;
}

const EmptyFlowState = ({ hasFlows, onCreateFlow }: EmptyFlowStateProps) => {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {!hasFlows ? 'Nenhum fluxo encontrado' : 'Nenhum fluxo corresponde aos filtros'}
          </h3>
          <p className="text-gray-600 mb-4">
            {!hasFlows ? 'Comece criando seu primeiro fluxo de captura de leads' : 'Tente ajustar os filtros de busca'}
          </p>
          {!hasFlows && (
            <Button onClick={onCreateFlow} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Fluxo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyFlowState;