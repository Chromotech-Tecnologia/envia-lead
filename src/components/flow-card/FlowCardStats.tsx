
interface FlowCardStatsProps {
  flow: any;
}

const FlowCardStats = ({ flow }: FlowCardStatsProps) => {
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
