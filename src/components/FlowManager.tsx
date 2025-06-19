
import { useState } from 'react';
import FlowSearch from './FlowSearch';
import FlowStats from './FlowStats';
import FlowCard from './FlowCard';
import EmptyFlowState from './EmptyFlowState';

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
      <FlowSearch 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />
      
      <FlowStats flows={flows} />

      {filteredFlows.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredFlows.map((flow) => (
            <FlowCard 
              key={flow.id} 
              flow={flow} 
              onEditFlow={onEditFlow}
            />
          ))}
        </div>
      ) : (
        <EmptyFlowState hasSearchTerm={!!searchTerm} />
      )}
    </div>
  );
};

export default FlowManager;
