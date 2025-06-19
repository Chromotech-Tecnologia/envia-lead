
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from 'lucide-react';

interface FlowEditorHeaderProps {
  isEditing: boolean;
}

const FlowEditorHeader = ({ isEditing }: FlowEditorHeaderProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          {isEditing ? 'Editar Fluxo' : 'Criar Novo Fluxo'}
        </CardTitle>
        <CardDescription>
          Configure as perguntas, aparência e comportamento do seu chat
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default FlowEditorHeader;
