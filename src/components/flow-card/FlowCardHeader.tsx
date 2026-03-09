
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Copy, Trash2, MoreVertical } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FlowCardHeaderProps {
  flow: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onFlowUpdate?: () => void;
}

const FlowCardHeader = ({ flow, onEdit, onDelete, onDuplicate, onFlowUpdate }: FlowCardHeaderProps) => {
  const { toast } = useToast();

  const handleToggleActive = async (checked: boolean) => {
    try {
      const { error } = await supabase
        .from('flows')
        .update({ is_active: checked })
        .eq('id', flow.id);

      if (error) throw error;

      toast({
        title: checked ? "Fluxo ativado" : "Fluxo desativado",
        description: `O fluxo foi ${checked ? 'ativado' : 'desativado'} com sucesso.`,
      });

      if (onFlowUpdate) {
        onFlowUpdate();
      }
    } catch (error) {
      console.error('Erro ao atualizar status do fluxo:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar o status do fluxo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-foreground mb-1 truncate">
          {flow.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {flow.description || 'Sem descrição'}
        </p>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {flow.primary_color && (
              <div 
                className="w-5 h-5 rounded-lg border-2 border-white shadow-sm"
                style={{ backgroundColor: flow.primary_color }}
                title="Cor primária"
              />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full animate-pulse-dot ${flow.is_active ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
              <span className={`text-xs font-medium ${flow.is_active ? 'text-green-600' : 'text-muted-foreground'}`}>
                {flow.is_active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <Switch
              checked={flow.is_active}
              onCheckedChange={handleToggleActive}
            />
          </div>
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground -mt-1">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover border-border shadow-3d">
          <DropdownMenuItem onClick={() => onEdit(flow.id)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDuplicate(flow.id)}>
            <Copy className="w-4 h-4 mr-2" />
            Duplicar
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onDelete(flow.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FlowCardHeader;
