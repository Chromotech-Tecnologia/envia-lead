
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Plus,
  Edit,
  Copy,
  Trash2,
  Play,
  Pause,
  MoreVertical,
  Globe,
  Users,
  TrendingUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FlowManagerProps {
  onEditFlow: (flow: any) => void;
}

const FlowManager = ({ onEditFlow }: FlowManagerProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const flows = [
    {
      id: 1,
      name: 'Captação de Leads - Produtos',
      description: 'Fluxo principal para captação de interessados em produtos',
      status: 'active',
      urls: ['www.exemplo.com/produtos', 'www.exemplo.com/catalogo'],
      position: 'bottom-right',
      acessos: 1250,
      leads: 320,
      conversao: 25.6,
      color: '#3B82F6',
      avatar: '/placeholder.svg',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'Qualificação de Serviços',
      description: 'Chat para qualificar interessados em serviços específicos',
      status: 'active',
      urls: ['www.exemplo.com/servicos'],
      position: 'bottom-left',
      acessos: 890,
      leads: 195,
      conversao: 21.9,
      color: '#10B981',
      avatar: '/placeholder.svg',
      createdAt: '2024-01-20'
    },
    {
      id: 3,
      name: 'Atendimento Suporte',
      description: 'Fluxo para direcionamento de suporte técnico',
      status: 'paused',
      urls: ['www.exemplo.com/suporte'],
      position: 'center',
      acessos: 450,
      leads: 67,
      conversao: 14.9,
      color: '#F59E0B',
      avatar: '/placeholder.svg',
      createdAt: '2024-01-25'
    }
  ];

  const filteredFlows = flows.filter(flow =>
    flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flow.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header e Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar fluxos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Importar Fluxo
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Criar Novo Fluxo
          </Button>
        </div>
      </div>

      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fluxos Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {flows.filter(f => f.status === 'active').length}
                </p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Acessos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {flows.reduce((acc, f) => acc + f.acessos, 0).toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversão Média</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(flows.reduce((acc, f) => acc + f.conversao, 0) / flows.length).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Fluxos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredFlows.map((flow) => (
          <Card key={flow.id} className="relative group hover:shadow-lg transition-all duration-300">
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
        ))}
      </div>
      
      {filteredFlows.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum fluxo encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Tente ajustar sua busca' : 'Comece criando seu primeiro fluxo de chat'}
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Fluxo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FlowManager;
