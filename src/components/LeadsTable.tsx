
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search,
  Filter,
  Download,
  ExternalLink,
  Calendar,
  Clock,
  Smartphone,
  Monitor,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';

const LeadsTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [flowFilter, setFlowFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [leads, setLeads] = useState<any[]>([]);
  const [flows, setFlows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadFlows();
    loadLeads();
  }, []);

  // Reload leads when filters change
  useEffect(() => {
    loadLeads();
  }, [statusFilter, flowFilter, dateFilter]);

  const loadFlows = async () => {
    const { data, error } = await supabase
      .from('flows')
      .select('id, name')
      .eq('is_active', true);
    
    if (!error && data) {
      setFlows(data);
    }
  };

  const loadLeads = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('leads')
        .select(`
          *,
          flows (
            name,
            attendant_name
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (statusFilter === 'completo') {
        query = query.eq('completed', true);
      } else if (statusFilter === 'incompleto') {
        query = query.eq('completed', false);
      }

      if (flowFilter !== 'all') {
        query = query.eq('flow_id', flowFilter);
      }

      if (dateFilter !== 'all') {
        const days = parseInt(dateFilter);
        const date = new Date();
        date.setDate(date.getDate() - days);
        query = query.gte('created_at', date.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      setLeads(data || []);

    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const sampleLeads = [
    {
      id: 1,
      nome: 'João Silva',
      email: 'joao@email.com',
      telefone: '(11) 99999-9999',
      fluxo: 'Captação de Leads - Produtos',
      status: 'completo',
      origem: '/produtos',
      dispositivo: 'desktop',
      dataHora: '2024-01-20 14:30',
      perguntasRespondidas: 5,
      totalPerguntas: 5,
      respostas: {
        'Nome': 'João Silva',
        'Email': 'joao@email.com',
        'Interesse': 'Produto Premium',
        'Orçamento': 'R$ 10.000 - R$ 50.000',
        'Urgência': 'Até 30 dias'
      }
    },
    {
      id: 2,
      nome: 'Maria Santos',
      email: 'maria@email.com',
      telefone: '(11) 88888-8888',
      fluxo: 'Qualificação de Serviços',
      status: 'incompleto',
      origem: '/servicos',
      dispositivo: 'mobile',
      dataHora: '2024-01-20 13:15',
      perguntasRespondidas: 3,
      totalPerguntas: 6,
      respostas: {
        'Nome': 'Maria Santos',
        'Email': 'maria@email.com',
        'Serviço': 'Consultoria'
      }
    },
    {
      id: 3,
      nome: 'Pedro Costa',
      email: 'pedro@email.com',
      telefone: '(11) 77777-7777',
      fluxo: 'Captação de Leads - Produtos',
      status: 'completo',
      origem: '/catalogo',
      dispositivo: 'desktop',
      dataHora: '2024-01-20 12:45',
      perguntasRespondidas: 5,
      totalPerguntas: 5,
      respostas: {
        'Nome': 'Pedro Costa',
        'Email': 'pedro@email.com',
        'Interesse': 'Produto Básico',
        'Orçamento': 'R$ 1.000 - R$ 5.000',
        'Urgência': 'Acima de 90 dias'
      }
    }
  ];

  const displayLeads = leads.length > 0 ? leads : sampleLeads;

  const filteredLeads = displayLeads.filter(lead => {
    const searchFields = [
      lead.responses?.nome || lead.nome || '',
      lead.responses?.email || lead.email || '', 
      lead.flows?.name || lead.fluxo || '',
      lead.responses?.name || '',
      lead.responses?.telefone || lead.telefone || ''
    ].join(' ').toLowerCase();
    
    const matchesSearch = searchFields.includes(searchTerm.toLowerCase());
    const matchesDevice = deviceFilter === 'all' || lead.dispositivo === deviceFilter;
    
    return matchesSearch && matchesDevice;
  });

  const generateWhatsAppLink = (lead: any) => {
    const respostasTexto = Object.entries(lead.respostas)
      .map(([pergunta, resposta]) => `${pergunta}: ${resposta}`)
      .join('\n');
    
    const mensagem = encodeURIComponent(
      `Olá! Sou ${lead.nome} e estou interessado(a) em seus produtos/serviços.\n\nMinhas informações:\n${respostasTexto}\n\nAguardo contato!`
    );
    
    return `https://api.whatsapp.com/send/?phone=5511999999999&text=${mensagem}`;
  };

  return (
    <div className="space-y-6">
      {/* Filtros e Ações */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div>
              <CardTitle>Gerenciamento de Leads</CardTitle>
              <CardDescription>
                Visualize, filtre e exporte seus leads capturados
              </CardDescription>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadLeads} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Busca */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, email ou fluxo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Filtro Dispositivo */}
              <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Dispositivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Dispositivos</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Filtro Status */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="completo">Completo</SelectItem>
                  <SelectItem value="incompleto">Incompleto</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Filtro Fluxo */}
              <Select value={flowFilter} onValueChange={setFlowFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Fluxo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Fluxos</SelectItem>
                  {flows.map(flow => (
                    <SelectItem key={flow.id} value={flow.id}>
                      {flow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Filtro Data */}
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Períodos</SelectItem>
                  <SelectItem value="1">Hoje</SelectItem>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{displayLeads.length}</p>
              <p className="text-sm text-gray-600">Total de Leads</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {displayLeads.filter(l => (l.completed || l.status === 'completo')).length}
              </p>
              <p className="text-sm text-gray-600">Completos</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {displayLeads.filter(l => (!l.completed && l.status !== 'completo')).length}
              </p>
              <p className="text-sm text-gray-600">Incompletos</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {displayLeads.length > 0 
                  ? ((displayLeads.filter(l => (l.completed || l.status === 'completo')).length / displayLeads.length) * 100).toFixed(1)
                  : 0
                }%
              </p>
              <p className="text-sm text-gray-600">Taxa de Conclusão</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Leads */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Fluxo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <p className="font-medium">{lead.responses?.nome || lead.nome}</p>
                      <p className="text-sm text-gray-600">{lead.responses?.email || lead.email}</p>
                      <p className="text-sm text-gray-600">{lead.responses?.telefone || lead.telefone}</p>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{lead.flows?.name || lead.fluxo}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant={(lead.completed || lead.status === 'completo') ? 'default' : 'secondary'}>
                      {(lead.completed || lead.status === 'completo') ? 'Completo' : 'Incompleto'}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {lead.dispositivo === 'desktop' ? 
                        <Monitor className="h-4 w-4 text-gray-600" /> :
                        <Smartphone className="h-4 w-4 text-gray-600" />
                      }
                      <span className="text-sm">{lead.origem}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">
                        {lead.created_at 
                          ? new Date(lead.created_at).toLocaleDateString('pt-BR') + ' ' + 
                            new Date(lead.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                          : lead.dataHora
                        }
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">
                        {lead.perguntasRespondidas}/{lead.totalPerguntas} perguntas
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(lead.perguntasRespondidas / lead.totalPerguntas) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(generateWhatsAppLink(lead), '_blank')}
                        className="text-green-600 hover:text-green-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredLeads.length === 0 && (
            <div className="py-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum lead encontrado
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || deviceFilter !== 'all' 
                  ? 'Tente ajustar seus filtros' 
                  : 'Seus leads capturados aparecerão aqui'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadsTable;
