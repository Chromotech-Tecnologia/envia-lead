
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Target,
  Monitor,
  Smartphone,
  Globe,
  Clock,
  CalendarIcon,
  Filter
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const DashboardMetrics = () => {
  const [dateFilter, setDateFilter] = useState('7');
  const [flowFilter, setFlowFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [flows, setFlows] = useState<any[]>([]);
  const [realMetrics, setRealMetrics] = useState<any>(null);
  const [customDateStart, setCustomDateStart] = useState<Date>();
  const [customDateEnd, setCustomDateEnd] = useState<Date>();
  const [showCustomDate, setShowCustomDate] = useState(false);

  // Load flows for filter
  useEffect(() => {
    loadFlows();
  }, []);

  // Load real metrics when filters change
  useEffect(() => {
    loadRealMetrics();
  }, [dateFilter, flowFilter, deviceFilter, customDateStart, customDateEnd]);

  const loadFlows = async () => {
    const { data, error } = await supabase
      .from('flows')
      .select('id, name')
      .eq('is_active', true);
    
    if (!error && data) {
      setFlows(data);
    }
  };

  const loadRealMetrics = async () => {
    try {
      // Calculate date range
      let startDate: Date, endDate: Date;
      
      if (dateFilter === 'custom' && customDateStart && customDateEnd) {
        startDate = customDateStart;
        endDate = customDateEnd;
      } else {
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - parseInt(dateFilter));
      }

      // Get leads data
      let leadsQuery = supabase
        .from('leads')
        .select('*, flow_id, created_at, ip_address, user_agent')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (flowFilter !== 'all') {
        leadsQuery = leadsQuery.eq('flow_id', flowFilter);
      }

      const { data: leads } = await leadsQuery;

      // Get visits (audiência)
      let visitsQuery = supabase
        .from('flow_visits')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (deviceFilter !== 'all') {
        if (deviceFilter === 'mobile') {
          visitsQuery = visitsQuery.or('user_agent.ilike.%mobile%,user_agent.ilike.%android%,user_agent.ilike.%iphone%');
        } else if (deviceFilter === 'desktop') {
          visitsQuery = visitsQuery.not('user_agent', 'ilike', '%mobile%')
                                   .not('user_agent', 'ilike', '%android%')
                                   .not('user_agent', 'ilike', '%iphone%')
                                   .not('user_agent', 'ilike', '%tablet%')
                                   .not('user_agent', 'ilike', '%ipad%');
        } else if (deviceFilter === 'tablet') {
          visitsQuery = visitsQuery.or('user_agent.ilike.%tablet%,user_agent.ilike.%ipad%');
        }
      }

      if (flowFilter !== 'all') {
        visitsQuery = visitsQuery.eq('flow_id', flowFilter);
      }

      const { data: visits } = await visitsQuery;

      // Get connections data (sessões ativas)
      let connectionsQuery = supabase
        .from('flow_connections')
        .select('*, created_at, url, user_agent')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (flowFilter !== 'all') {
        connectionsQuery = connectionsQuery.eq('flow_id', flowFilter);
      }

      const { data: connections } = await connectionsQuery;

      // Get flow URLs for mapping
      const { data: flowUrls } = await supabase
        .from('flow_urls')
        .select('*');

      // Calculate metrics
      const totalVisits = visits?.length || 0;  // Audiência total
      const totalConnections = connections?.length || 0;  // Sessões ativas
      const totalLeads = leads?.length || 0;  // Leads gerados
      const completedLeads = leads?.filter(l => l.completed)?.length || 0;
      const conversionRate = totalVisits > 0 ? (totalLeads / totalVisits) * 100 : 0;  // Taxa baseada em visitas

      // Device analysis baseado em visitas (audiência)
      const deviceStats = visits?.reduce((acc, visit) => {
        const userAgent = visit.user_agent?.toLowerCase() || '';
        let device = 'desktop';
        
        if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
          device = 'mobile';
        } else if (userAgent.includes('tablet') || userAgent.includes('ipad')) {
          device = 'tablet';
        }
        
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // URL analysis baseado em visitas
      const urlStats = visits?.reduce((acc, visit) => {
        const url = new URL(visit.url).pathname;
        acc[url] = (acc[url] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Hourly analysis baseado em visitas
      const hourlyStats = visits?.reduce((acc, visit) => {
        const hour = new Date(visit.created_at).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>) || {};

      setRealMetrics({
        totalConnections: totalVisits,  // Agora representa visitas (audiência)
        totalLeads,
        completedLeads,
        conversionRate: conversionRate.toFixed(1),
        leads: leads || [],
        connections: visits || [],  // Armazena visitas para análises
        deviceStats,
        urlStats,
        hourlyStats
      });

    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };
  const metrics = realMetrics ? [
    {
      title: "Total de Visitas",
      value: realMetrics.totalConnections.toLocaleString(),
      change: "+12.5%",
      changeType: "positive",
      icon: MessageSquare,
      description: "Audiência do site"
    },
    {
      title: "Leads Gerados",
      value: realMetrics.totalLeads.toLocaleString(),
      change: "+8.1%", 
      changeType: "positive",
      icon: Users,
      description: "Leads capturados"
    },
    {
      title: "Taxa de Conversão",
      value: `${realMetrics.conversionRate}%`,
      change: "+2.3%",
      changeType: "positive", 
      icon: Target,
      description: "Leads por visitas"
    },
    {
      title: "Leads Completos",
      value: realMetrics.completedLeads.toLocaleString(),
      change: "+3",
      changeType: "neutral",
      icon: Globe,
      description: "Formulários finalizados"
    }
  ] : [];

  // Generate real chart data from metrics
  const chartData = realMetrics ? (() => {
    const monthlyData = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthConnections = realMetrics.connections.filter(c => 
        new Date(c.created_at).getMonth() === date.getMonth() &&
        new Date(c.created_at).getFullYear() === date.getFullYear()
      ).length;
      
      const monthLeads = realMetrics.leads.filter(l => 
        new Date(l.created_at).getMonth() === date.getMonth() &&
        new Date(l.created_at).getFullYear() === date.getFullYear()
      ).length;
      
      monthlyData.push({
        name: date.toLocaleDateString('pt-BR', { month: 'short' }),
        acessos: monthConnections,
        leads: monthLeads,
        conversao: monthConnections > 0 ? ((monthLeads / monthConnections) * 100) : 0
      });
    }
    
    return monthlyData;
  })() : [
    { name: 'Jan', acessos: 0, leads: 0, conversao: 0 },
    { name: 'Fev', acessos: 0, leads: 0, conversao: 0 },
    { name: 'Mar', acessos: 0, leads: 0, conversao: 0 },
    { name: 'Abr', acessos: 0, leads: 0, conversao: 0 },
    { name: 'Mai', acessos: 0, leads: 0, conversao: 0 },
    { name: 'Jun', acessos: 0, leads: 0, conversao: 0 },
  ];

  const deviceData = realMetrics?.deviceStats ? Object.entries(realMetrics.deviceStats).map(([device, count], index) => ({
    name: device === 'desktop' ? 'Desktop' : device === 'mobile' ? 'Mobile' : 'Tablet',
    value: Math.round((Number(count) / realMetrics.totalConnections) * 100),
    color: ['#3B82F6', '#10B981', '#F59E0B'][index] || '#6B7280'
  })) : [
    { name: 'Desktop', value: 60, color: '#3B82F6' },
    { name: 'Mobile', value: 35, color: '#10B981' },
    { name: 'Tablet', value: 5, color: '#F59E0B' },
  ];

  const hourlyData = realMetrics?.hourlyStats ? Object.entries(realMetrics.hourlyStats)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([hour, count]) => ({
      hora: `${hour.padStart(2, '0')}h`,
      acessos: Number(count)
    })) : [
    { hora: '00h', acessos: 12 },
    { hora: '04h', acessos: 8 },
    { hora: '08h', acessos: 45 },
    { hora: '12h', acessos: 78 },
    { hora: '16h', acessos: 92 },
    { hora: '20h', acessos: 67 },
  ];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Período</Label>
              <Select value={dateFilter} onValueChange={(value) => {
                if (value === 'custom') {
                  setShowCustomDate(true);
                } else {
                  setShowCustomDate(false);
                }
                setDateFilter(value);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Hoje</SelectItem>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="custom">Período Personalizado</SelectItem>
                </SelectContent>
              </Select>
              
              {showCustomDate && (
                <div className="flex gap-2 mt-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !customDateStart && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customDateStart ? format(customDateStart, "dd/MM/yyyy") : "Data inicial"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customDateStart}
                        onSelect={setCustomDateStart}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !customDateEnd && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customDateEnd ? format(customDateEnd, "dd/MM/yyyy") : "Data final"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customDateEnd}
                        onSelect={setCustomDateEnd}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
            
            <div>
              <Label>Fluxo</Label>
              <Select value={flowFilter} onValueChange={setFlowFilter}>
                <SelectTrigger>
                  <SelectValue />
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
            </div>
            
            <div>
              <Label>Dispositivo</Label>
              <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Dispositivos</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {metric.value}
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={metric.changeType === 'positive' ? 'default' : 'secondary'}
                    className={metric.changeType === 'positive' ? 'bg-green-100 text-green-700' : ''}
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {metric.change}
                  </Badge>
                  <span className="text-xs text-gray-500">{metric.description}</span>
                </div>
              </CardContent>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </Card>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras - Acessos vs Leads */}
        <Card>
          <CardHeader>
            <CardTitle>Acessos vs Leads por Mês</CardTitle>
            <CardDescription>
              Comparativo de acessos e leads gerados nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="acessos" fill="#3B82F6" name="Acessos" />
                <Bar dataKey="leads" fill="#10B981" name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Dispositivos */}
        <Card>
          <CardHeader>
            <CardTitle>Acessos por Dispositivo</CardTitle>
            <CardDescription>
              Distribuição de acessos por tipo de dispositivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Acessos por Hora */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Acessos por Horário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="acessos" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top URLs */}
        <Card>
          <CardHeader>
            <CardTitle>Top URLs de Origem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {realMetrics?.urlStats ? Object.entries(realMetrics.urlStats)
                .sort(([,a], [,b]) => Number(b) - Number(a))
                .slice(0, 4)
                .map(([url, count], index) => {
                  const conversionRate = realMetrics.leads.filter(l => 
                    l.responses && JSON.stringify(l.responses).includes(url)
                  ).length / Number(count) * 100;
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{url}</p>
                        <p className="text-xs text-gray-500">{String(count)} acessos</p>
                      </div>
                      <Badge variant="outline">
                        {conversionRate.toFixed(1)}% conversão
                      </Badge>
                    </div>
                  );
                }) : [
                { url: '/produtos', acessos: 1250, conversao: 28 },
                { url: '/servicos', acessos: 980, conversao: 22 },
                { url: '/sobre', acessos: 750, conversao: 15 },
                { url: '/contato', acessos: 620, conversao: 35 },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{item.url}</p>
                    <p className="text-xs text-gray-500">{item.acessos} acessos</p>
                  </div>
                  <Badge variant="outline">
                    {item.conversao}% conversão
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance em Tempo Real */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Acessos (Meta: 100)</span>
                  <span>{realMetrics?.totalConnections || 0}</span>
                </div>
                <Progress value={Math.min((realMetrics?.totalConnections || 0) / 100 * 100, 100)} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Leads (Meta: 25)</span>
                  <span>{realMetrics?.totalLeads || 0}</span>
                </div>
                <Progress value={Math.min((realMetrics?.totalLeads || 0) / 25 * 100, 100)} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Conversão (Meta: 20%)</span>
                  <span>{realMetrics?.conversionRate || 0}%</span>
                </div>
                <Progress value={Math.min(parseFloat(realMetrics?.conversionRate || '0') / 20 * 100, 100)} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardMetrics;
