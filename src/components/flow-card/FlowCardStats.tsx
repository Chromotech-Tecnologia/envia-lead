import { Wifi, WifiOff, HelpCircle, Link2, Mail, Globe } from 'lucide-react';
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

  const getQuestionCount = () => flow.questions?.length || 0;
  const getUrlCount = () => flow.flow_urls?.length || 0;
  const getEmailCount = () => flow.flow_emails?.length || 0;

  return (
    <>
      {/* Status de Conexão */}
      <div className="flex items-center justify-between mb-3">
        <Badge 
          variant={connectionStatus.isConnected ? "default" : "secondary"}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg ${
            connectionStatus.isConnected 
              ? "bg-green-500/10 text-green-700 border border-green-200" 
              : "bg-muted text-muted-foreground"
          }`}
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
        <div className="mb-3 p-2.5 bg-green-50 rounded-xl border border-green-100">
          <div className="text-xs text-green-700 font-semibold mb-0.5">WhatsApp</div>
          <div className="text-xs text-green-600">{flow.whatsapp}</div>
        </div>
      )}

      {/* Email de Notificação */}
      {flow.flow_emails && flow.flow_emails.length > 0 && (
        <div className="mb-3 p-2.5 bg-blue-50 rounded-xl border border-blue-100">
          <div className="text-xs text-blue-700 font-semibold mb-0.5">Emails</div>
          {flow.flow_emails.slice(0, 2).map((email: any, index: number) => (
            <div key={index} className="text-xs text-blue-600 truncate">
              {email.email}
            </div>
          ))}
          {flow.flow_emails.length > 2 && (
            <div className="text-xs text-blue-500 mt-0.5">
              +{flow.flow_emails.length - 2} emails
            </div>
          )}
        </div>
      )}

      {/* Site Conectado */}
      {connectionStatus.isConnected && activeConnections.length > 0 && (
        <div className="mb-3 p-2.5 bg-green-50 rounded-xl border border-green-100">
          <div className="text-xs text-green-700 font-semibold mb-0.5">Site Conectado</div>
          <div className="text-xs text-green-600 truncate" title={activeConnections[0].url}>
            {activeConnections[0].url}
          </div>
          <div className="text-xs text-green-500 mt-0.5">
            Última atividade: {new Date(activeConnections[0].last_ping).toLocaleString('pt-BR')}
          </div>
          {activeConnections.length > 1 && (
            <div className="text-xs text-green-500">
              +{activeConnections.length - 1} site{activeConnections.length > 2 ? 's' : ''} conectado{activeConnections.length > 2 ? 's' : ''}
            </div>
          )}
        </div>
      )}
      
      {/* Stats mini-cards */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="flex flex-col items-center p-2.5 rounded-xl bg-primary/5 border border-primary/10">
          <HelpCircle className="w-4 h-4 text-primary mb-1" />
          <span className="text-base font-bold text-foreground">{getQuestionCount()}</span>
          <span className="text-[10px] text-muted-foreground font-medium">Perguntas</span>
        </div>
        <div className="flex flex-col items-center p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/10">
          <Link2 className="w-4 h-4 text-blue-500 mb-1" />
          <span className="text-base font-bold text-foreground">{getUrlCount()}</span>
          <span className="text-[10px] text-muted-foreground font-medium">URLs</span>
        </div>
        <div className="flex flex-col items-center p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <Mail className="w-4 h-4 text-amber-500 mb-1" />
          <span className="text-base font-bold text-foreground">{getEmailCount()}</span>
          <span className="text-[10px] text-muted-foreground font-medium">E-mails</span>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        Criado em {formatDate(flow.created_at)}
        {flow.updated_at !== flow.created_at && (
          <span> • Atualizado em {formatDate(flow.updated_at)}</span>
        )}
      </div>
    </>
  );
};

export default FlowCardStats;
