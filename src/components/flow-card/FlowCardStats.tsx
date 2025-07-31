import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useFlowConnections } from "@/hooks/useFlowConnections";

interface FlowCardStatsProps {
  flow: any;
}

const FlowCardStats = ({ flow }: FlowCardStatsProps) => {
  const { connectionStatus, activeConnections } = useFlowConnections(flow?.id);
  
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
        
      </div>

      {/* WhatsApp */}
      {flow.whatsapp && (
        <div className="mb-4 p-2 bg-green-50 rounded-lg border border-green-200">
          <div className="text-xs text-green-700 font-medium">WhatsApp:</div>
          <div className="text-xs text-green-600">{flow.whatsapp}</div>
        </div>
      )}

      {/* Email de Notificação */}
      {flow.flow_emails && flow.flow_emails.length > 0 && (
        <div className="mb-4 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs text-blue-700 font-medium">Emails:</div>
          {flow.flow_emails.slice(0, 2).map((email: any, index: number) => (
            <div key={index} className="text-xs text-blue-600 truncate">
              {email.email}
            </div>
          ))}
          {flow.flow_emails.length > 2 && (
            <div className="text-xs text-blue-500">
              +{flow.flow_emails.length - 2} emails
            </div>
          )}
        </div>
      )}

      {/* Site Conectado */}
      {connectionStatus.isConnected && activeConnections.length > 0 && (
        <div className="mb-4 p-2 bg-green-50 rounded-lg border border-green-200">
          <div className="text-xs text-green-700 font-medium">Site Conectado:</div>
          <div className="text-xs text-green-600 truncate" title={activeConnections[0].url}>
            {activeConnections[0].url}
          </div>
          <div className="text-xs text-green-500">
            Última atividade: {new Date(activeConnections[0].last_ping).toLocaleString('pt-BR')}
          </div>
          {activeConnections.length > 1 && (
            <div className="text-xs text-green-500">
              +{activeConnections.length - 1} site{activeConnections.length > 2 ? 's' : ''} conectado{activeConnections.length > 2 ? 's' : ''}
            </div>
          )}
        </div>
      )}
      
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