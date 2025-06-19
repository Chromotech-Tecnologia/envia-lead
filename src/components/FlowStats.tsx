
import { Card, CardContent } from "@/components/ui/card";
import { Play, Users, TrendingUp } from 'lucide-react';

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

interface FlowStatsProps {
  flows: Flow[];
}

const FlowStats = ({ flows }: FlowStatsProps) => {
  return (
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
  );
};

export default FlowStats;
