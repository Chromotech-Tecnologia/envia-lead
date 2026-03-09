
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

  useEffect(() => { loadFlows(); }, []);
  useEffect(() => { loadRealMetrics(); }, [dateFilter, flowFilter, deviceFilter, customDateStart, customDateEnd]);

  const loadFlows = async () => {
    const { data, error } = await supabase.from('flows').select('id, name').eq('is_active', true);
    if (!error && data) setFlows(data);
  };

  const loadRealMetrics = async () => {
    try {
      let startDate: Date, endDate: Date;
      if (dateFilter === 'custom' && customDateStart && customDateEnd) {
        startDate = customDateStart;
        endDate = customDateEnd;
      } else {
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - parseInt(dateFilter));
      }

      let leadsQuery = supabase.from('leads').select('*, flow_id, created_at, ip_address, user_agent')
        .gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString());
      if (flowFilter !== 'all') leadsQuery = leadsQuery.eq('flow_id', flowFilter);
      const { data: leads } = await leadsQuery;

      let visitsQuery = supabase.from('flow_visits').select('*')
        .gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString());
      if (deviceFilter !== 'all') {
        if (deviceFilter === 'mobile') visitsQuery = visitsQuery.or('user_agent.ilike.%mobile%,user_agent.ilike.%android%,user_agent.ilike.%iphone%');
        else if (deviceFilter === 'desktop') visitsQuery = visitsQuery.not('user_agent', 'ilike', '%mobile%').not('user_agent', 'ilike', '%android%').not('user_agent', 'ilike', '%iphone%').not('user_agent', 'ilike', '%tablet%').not('user_agent', 'ilike', '%ipad%');
        else if (deviceFilter === 'tablet') visitsQuery = visitsQuery.or('user_agent.ilike.%tablet%,user_agent.ilike.%ipad%');
      }
      if (flowFilter !== 'all') visitsQuery = visitsQuery.eq('flow_id', flowFilter);
      const { data: visits } = await visitsQuery;

      let connectionsQuery = supabase.from('flow_connections').select('*, created_at, url, user_agent')
        .gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString());
      if (flowFilter !== 'all') connectionsQuery = connectionsQuery.eq('flow_id', flowFilter);
      const { data: connections } = await connectionsQuery;

      const { data: flowUrls } = await supabase.from('flow_urls').select('*');

      const totalVisits = visits?.length || 0;
      const totalLeads = leads?.length || 0;
      const completedLeads = leads?.filter(l => l.completed)?.length || 0;
      const conversionRate = totalVisits > 0 ? (totalLeads / totalVisits) * 100 : 0;

      const deviceStats = visits?.reduce((acc, visit) => {
        const userAgent = visit.user_agent?.toLowerCase() || '';
        let device = 'desktop';
        if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) device = 'mobile';
        else if (userAgent.includes('tablet') || userAgent.includes('ipad')) device = 'tablet';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const urlStats = visits?.reduce((acc, visit) => {
        const url = new URL(visit.url).pathname;
        acc[url] = (acc[url] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const hourlyStats = visits?.reduce((acc, visit) => {
        const hour = new Date(visit.created_at).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>) || {};

      setRealMetrics({
        totalConnections: totalVisits,
        totalLeads,
        completedLeads,
        conversionRate: conversionRate.toFixed(1),
        leads: leads || [],
        connections: visits || [],
        deviceStats,
        urlStats,
        hourlyStats
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const metricConfigs = [
    { iconClass: 'metric-icon metric-icon-purple', icon: MessageSquare },
    { iconClass: 'metric-icon metric-icon-blue', icon: Users },
    { iconClass: 'metric-icon metric-icon-green', icon: Target },
    { iconClass: 'metric-icon metric-icon-amber', icon: Globe },
  ];

  const metrics = realMetrics ? [
    { title: "Total de Visitas", value: realMetrics.totalConnections.toLocaleString(), change: "+12.5%", changeType: "positive", description: "Audiência do site" },
    { title: "Leads Gerados", value: realMetrics.totalLeads.toLocaleString(), change: "+8.1%", changeType: "positive", description: "Leads capturados" },
    { title: "Taxa de Conversão", value: `${realMetrics.conversionRate}%`, change: "+2.3%", changeType: "positive", description: "Leads por visitas" },
    { title: "Leads Completos", value: realMetrics.completedLeads.toLocaleString(), change: "+3", changeType: "neutral", description: "Formulários finalizados" }
  ] : [];

  const chartData = realMetrics ? (() => {
    const monthlyData = [];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthConnections = realMetrics.connections.filter((c: any) => new Date(c.created_at).getMonth() === date.getMonth() && new Date(c.created_at).getFullYear() === date.getFullYear()).length;
      const monthLeads = realMetrics.leads.filter((l: any) => new Date(l.created_at).getMonth() === date.getMonth() && new Date(l.created_at).getFullYear() === date.getFullYear()).length;
      monthlyData.push({ name: date.toLocaleDateString('pt-BR', { month: 'short' }), acessos: monthConnections, leads: monthLeads, conversao: monthConnections > 0 ? ((monthLeads / monthConnections) * 100) : 0 });
    }
    return monthlyData;
  })() : [
    { name: 'Jan', acessos: 0, leads: 0, conversao: 0 }, { name: 'Fev', acessos: 0, leads: 0, conversao: 0 },
    { name: 'Mar', acessos: 0, leads: 0, conversao: 0 }, { name: 'Abr', acessos: 0, leads: 0, conversao: 0 },
    { name: 'Mai', acessos: 0, leads: 0, conversao: 0 }, { name: 'Jun', acessos: 0, leads: 0, conversao: 0 },
  ];

  const deviceData = realMetrics?.deviceStats ? Object.entries(realMetrics.deviceStats).map(([device, count], index) => ({
    name: device === 'desktop' ? 'Desktop' : device === 'mobile' ? 'Mobile' : 'Tablet',
    value: Math.round((Number(count) / realMetrics.totalConnections) * 100),
    color: ['hsl(267 100% 50%)', 'hsl(142 76% 36%)', 'hsl(38 92% 50%)'][index] || 'hsl(215 16% 47%)'
  })) : [
    { name: 'Desktop', value: 60, color: 'hsl(267 100% 50%)' },
    { name: 'Mobile', value: 35, color: 'hsl(142 76% 36%)' },
    { name: 'Tablet', value: 5, color: 'hsl(38 92% 50%)' },
  ];

  const hourlyData = realMetrics?.hourlyStats ? Object.entries(realMetrics.hourlyStats)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([hour, count]) => ({ hora: `${hour.padStart(2, '0')}h`, acessos: Number(count) }))
    : [
      { hora: '00h', acessos: 12 }, { hora: '04h', acessos: 8 }, { hora: '08h', acessos: 45 },
      { hora: '12h', acessos: 78 }, { hora: '16h', acessos: 92 }, { hora: '20h', acessos: 67 },
    ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient-primary">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Acompanhe o desempenho dos seus fluxos</p>
      </div>

      {/* Filtros */}
      <Card className="glass-card shadow-3d border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="metric-icon metric-icon-purple w-8 h-8 rounded-lg">
              <Filter className="w-4 h-4" />
            </div>
            Filtros de Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Período</Label>
              <Select value={dateFilter} onValueChange={(value) => {
                setShowCustomDate(value === 'custom');
                setDateFilter(value);
              }}>
                <SelectTrigger className="rounded-xl mt-1.5">
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
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded-xl", !customDateStart && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customDateStart ? format(customDateStart, "dd/MM/yyyy") : "Data inicial"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={customDateStart} onSelect={setCustomDateStart} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded-xl", !customDateEnd && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customDateEnd ? format(customDateEnd, "dd/MM/yyyy") : "Data final"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={customDateEnd} onSelect={setCustomDateEnd} initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
            
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fluxo</Label>
              <Select value={flowFilter} onValueChange={setFlowFilter}>
                <SelectTrigger className="rounded-xl mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Fluxos</SelectItem>
                  {flows.map(flow => (
                    <SelectItem key={flow.id} value={flow.id}>{flow.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dispositivo</Label>
              <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                <SelectTrigger className="rounded-xl mt-1.5">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((metric, index) => {
          const config = metricConfigs[index];
          const Icon = config.icon;
          return (
            <Card 
              key={index} 
              className="glass-card border-0 shadow-3d hover:-translate-y-1 hover:shadow-3d-hover transition-all duration-300 group relative overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={config.iconClass}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge 
                    className={`text-xs px-2 py-0.5 rounded-lg font-medium ${
                      metric.changeType === 'positive' 
                        ? 'bg-green-500/10 text-green-700 border border-green-200' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {metric.change}
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{metric.value}</div>
                <div className="text-sm font-medium text-muted-foreground">{metric.title}</div>
                <div className="text-xs text-muted-foreground/70 mt-0.5">{metric.description}</div>
              </CardContent>
              <div className="absolute bottom-0 left-0 w-full h-0.5 envia-lead-gradient transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </Card>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-0 shadow-3d">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Acessos vs Leads por Mês</CardTitle>
            <CardDescription>Comparativo dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }} />
                <Legend />
                <Bar dataKey="acessos" fill="hsl(267 100% 50%)" name="Acessos" radius={[4, 4, 0, 0]} />
                <Bar dataKey="leads" fill="hsl(142 76% 36%)" name="Leads" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 shadow-3d">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Acessos por Dispositivo</CardTitle>
            <CardDescription>Distribuição por tipo de dispositivo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} fill="hsl(var(--primary))" dataKey="value">
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card border-0 shadow-3d">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="metric-icon metric-icon-blue w-8 h-8 rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
              Acessos por Horário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hora" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))' }} />
                <Line type="monotone" dataKey="acessos" stroke="hsl(267 100% 50%)" strokeWidth={2} dot={{ fill: 'hsl(267 100% 50%)', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 shadow-3d">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top URLs de Origem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {realMetrics?.urlStats ? Object.entries(realMetrics.urlStats)
                .sort(([,a], [,b]) => Number(b) - Number(a))
                .slice(0, 4)
                .map(([url, count], index) => {
                  const conversionRate = realMetrics.leads.filter((l: any) => 
                    l.responses && JSON.stringify(l.responses).includes(url)
                  ).length / Number(count) * 100;
                  return (
                    <div key={index} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-foreground truncate">{url}</p>
                        <p className="text-xs text-muted-foreground">{String(count)} acessos</p>
                      </div>
                      <Badge variant="outline" className="ml-2 rounded-lg text-xs">
                        {conversionRate.toFixed(1)}%
                      </Badge>
                    </div>
                  );
                }) : [
                { url: '/produtos', acessos: 1250, conversao: 28 },
                { url: '/servicos', acessos: 980, conversao: 22 },
                { url: '/sobre', acessos: 750, conversao: 15 },
                { url: '/contato', acessos: 620, conversao: 35 },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50">
                  <div>
                    <p className="font-medium text-sm text-foreground">{item.url}</p>
                    <p className="text-xs text-muted-foreground">{item.acessos} acessos</p>
                  </div>
                  <Badge variant="outline" className="rounded-lg text-xs">
                    {item.conversao}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 shadow-3d">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Performance Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Acessos (Meta: 100)</span>
                  <span className="font-semibold text-foreground">{realMetrics?.totalConnections || 0}</span>
                </div>
                <Progress value={Math.min((realMetrics?.totalConnections || 0) / 100 * 100, 100)} className="h-2.5 rounded-full" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Leads (Meta: 25)</span>
                  <span className="font-semibold text-foreground">{realMetrics?.totalLeads || 0}</span>
                </div>
                <Progress value={Math.min((realMetrics?.totalLeads || 0) / 25 * 100, 100)} className="h-2.5 rounded-full" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Conversão (Meta: 20%)</span>
                  <span className="font-semibold text-foreground">{realMetrics?.conversionRate || 0}%</span>
                </div>
                <Progress value={Math.min(parseFloat(realMetrics?.conversionRate || '0') / 20 * 100, 100)} className="h-2.5 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardMetrics;
