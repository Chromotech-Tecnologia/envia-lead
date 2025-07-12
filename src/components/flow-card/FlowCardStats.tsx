import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useFlowConnections } from "@/hooks/useFlowConnections";

interface FlowCardStatsProps {
  flow: any;
}

const FlowCardStats = ({ flow }: FlowCardStatsProps) => {
  const { connectionStatus } = useFlowConnections(flow?.id);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getQuestionCount = () => {
    return flow.questions?.length || 0;
  };

  const getUrlCount = () => {
    return flow.flow_urls?.length || 0;
  };

  const getEmailCount = () => {
    return flow.flow_emails?.length || 0;
  };

  return (
    <>
      {/* Status de Conexão */}
      <div className="flex items-center justify-between mb-4">
        <Badge 
          variant={connectionStatus.isConnected ? "default" : "secondary"}
          className={`flex items-center gap-1 ${connectionStatus.isConnected ? "bg-green-500" : ""}`}
        >
          {connectionStatus.isConnected ? (
            <>
              <Wifi className="w-3 h-3" />
              Conectado
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              Desconectado
            </>
          )}
        </Badge>
        
        <Badge 
          variant={flow.is_active ? "default" : "secondary"}
          className={flow.is_active ? "bg-blue-500" : ""}
        >
          {flow.is_active ? "Ativo" : "Inativo"}
        </Badge>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
        <div>
          <span className="font-medium">{getQuestionCount()}</span>
          <br />
          <span className="text-xs">Perguntas</span>
        </div>
        <div>
          <span className="font-medium">{getUrlCount()}</span>
          <br />
          <span className="text-xs">URLs</span>
        </div>
        <div>
          <span className="font-medium">{getEmailCount()}</span>
          <br />
          <span className="text-xs">E-mails</span>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 mb-4">
        Criado em {formatDate(flow.created_at)}
        {flow.updated_at !== flow.created_at && (
          <span> • Atualizado em {formatDate(flow.updated_at)}</span>
        )}
      </div>
    </>
  );
};

export default FlowCardStats;