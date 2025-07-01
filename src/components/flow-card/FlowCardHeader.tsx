
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Copy, Trash2, MoreVertical } from 'lucide-react';

interface FlowCardHeaderProps {
  flow: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const FlowCardHeader = ({ flow, onEdit, onDelete, onDuplicate }: FlowCardHeaderProps) => {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {flow.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          {flow.description || 'Sem descrição'}
        </p>
        
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={flow.is_active ? "default" : "secondary"}>
            {flow.is_active ? 'Ativo' : 'Inativo'}
          </Badge>
          
          {flow.primary_color && (
            <div 
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: flow.primary_color }}
              title="Cor primária"
            />
          )}
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white">
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
            className="text-red-600"
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
