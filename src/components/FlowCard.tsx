
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Edit,
  Copy,
  Trash2,
  Play,
  Pause,
  MoreVertical,
  Globe
} from 'lucide-react';

interface Flow {
  id: number;
  name: string;
  description: string;
  status: string;
  urls: string[];
  position: string;
  acessos: number;
  leads: number;
  conversao: number;
  color: string;
  avatar: string;
  createdAt: string;
}

interface FlowCardProps {
  flow: Flow;
  onEditFlow: (flow: Flow) => void;
}

const FlowCard = ({ flow, onEditFlow }: FlowCardProps) => {
  return (
    <Card className="relative group hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: flow.color }}
            >
              {flow.name.charAt(0)}
            </div>
            <div>
              <CardTitle className="text-lg">{flow.name}</CardTitle>
              <Badge variant={flow.status === 'active' ? 'default' : 'secondary'}>
                {flow.status === 'active' ? 'Ativo' : 'Pausado'}
              </Badge>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditFlow(flow)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem>
                {flow.status === 'active' ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {flow.status === 'active' ? 'Pausar' : 'Ativar'}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <CardDescription>{flow.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* URLs */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">URLs Ativas:</p>
            <div className="space-y-1">
              {flow.urls.map((url, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <Globe className="h-3 w-3" />
                  {url}
                </div>
              ))}
            </div>
          </div>
          
          {/* Métricas */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t">
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">{flow.acessos.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Acessos</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">{flow.leads}</p>
              <p className="text-xs text-gray-500">Leads</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-600">{flow.conversao}%</p>
              <p className="text-xs text-gray-500">Conversão</p>
            </div>
          </div>
          
          {/* Ações */}
          <div className="flex gap-2 pt-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onEditFlow(flow)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlowCard;
