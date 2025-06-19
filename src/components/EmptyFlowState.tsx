
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Bot } from 'lucide-react';

interface EmptyFlowStateProps {
  hasSearchTerm: boolean;
}

const EmptyFlowState = ({ hasSearchTerm }: EmptyFlowStateProps) => {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Bot className="h-12 w-12 text-purple-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum fluxo encontrado
        </h3>
        <p className="text-gray-600 mb-4">
          {hasSearchTerm ? 'Tente ajustar sua busca' : 'Comece criando seu primeiro fluxo de chat'}
        </p>
        <Button className="envia-lead-gradient hover:opacity-90 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Criar Primeiro Fluxo
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyFlowState;
