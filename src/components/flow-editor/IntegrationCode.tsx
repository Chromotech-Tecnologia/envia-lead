import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Copy, Check, Code, Globe, Wifi, WifiOff, Clock, Users, Power } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useFlowConnections } from "@/hooks/useFlowConnections";
import { useFlowPersistence } from "@/hooks/useFlowPersistence";

interface IntegrationCodeProps {
  flow?: any;
  flowData: any;
}

const IntegrationCode = ({ flow, flowData }: IntegrationCodeProps) => {
  const [copied, setCopied] = useState(false);
  const [copiedCompany, setCopiedCompany] = useState(false);
  const { toast } = useToast();
  const { updateFlow } = useFlowPersistence(flow?.id || '');
  
  // Monitor connections for this flow
  const { connectionStatus, activeConnections, loading: connectionsLoading } = useFlowConnections(flow?.id);

  // Generate a unique code for the flow based on ID
  const generateFlowCode = () => {
    if (!flow?.id) return 'FLOW_ID_NOT_FOUND';
    
    // Create a more friendly code based on flow ID
    const flowId = flow.id.replace(/-/g, '').substring(0, 16);
    return `EL_${flowId.toUpperCase()}`;
  };

  const generateIntegrationCode = () => {
    const realFlowId = flow?.id;
    return `<script src='https://fuzkdrkhvmaimpgzvimq.supabase.co/functions/v1/envialead-widget?flow=${realFlowId}'></script>`;
  };

  const generateCompanyCode = () => {
    const companyId = flow?.company_id || flowData?.company_id;
    return `<script src='https://fuzkdrkhvmaimpgzvimq.supabase.co/functions/v1/envialead-loader?company=${companyId}'></script>`;
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generateIntegrationCode());
      setCopied(true);
      toast({
        title: "Código copiado!",
        description: "O código de integração foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código. Tente novamente.",
      });
    }
  };

  const formatLastConnection = (lastConnection: string | null) => {
    if (!lastConnection) return 'Nunca';
    
    const date = new Date(lastConnection);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes} min atrás`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const handleActiveToggle = async (checked: boolean) => {
    if (!flow?.id) return;

    try {
      await updateFlow(flow.id, { is_active: checked });
      
      // Forçar atualização do estado local
      flow.is_active = checked;
      
      toast({
        title: checked ? "Fluxo ativado!" : "Fluxo desativado!",
        description: checked ? 
          "O fluxo agora aparecerá nos sites onde foi instalado." :
          "O fluxo foi desativado e não aparecerá mais nos sites.",
      });
      
      // Recarregar a página para atualizar o estado
      window.location.reload();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível alterar o status do fluxo.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Flow Control Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Power className="w-5 h-5" />
            Controle do Fluxo
          </CardTitle>
          <CardDescription>
            Ative ou desative o fluxo nos sites onde foi instalado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="font-medium">Status do Fluxo</div>
              <div className="text-sm text-gray-600">
                {flow?.is_active ? 
                  "O fluxo está ativo e aparecerá nos sites onde foi instalado" :
                  "O fluxo está inativo e não aparecerá nos sites"
                }
              </div>
            </div>
            <Switch
              checked={Boolean(flow?.is_active)}
              onCheckedChange={handleActiveToggle}
              disabled={!flow?.id}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <Badge 
              variant={flow?.is_active ? "default" : "secondary"}
              className={flow?.is_active ? "bg-green-500" : ""}
            >
              {flow?.is_active ? "Ativo" : "Inativo"}
            </Badge>
            
            <Badge 
              variant={connectionStatus.isConnected ? "default" : "secondary"}
              className={connectionStatus.isConnected ? "bg-blue-500" : ""}
            >
              {connectionStatus.isConnected ? (
                <>
                  <Wifi className="w-3 h-3 mr-1" />
                  Conectado
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 mr-1" />
                  Desconectado
                </>
              )}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {connectionStatus.isConnected ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-gray-400" />
            )}
            Status da Conexão
          </CardTitle>
          <CardDescription>
            Monitoramento em tempo real das conexões ativas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge 
                variant={connectionStatus.isConnected ? "default" : "secondary"}
                className={connectionStatus.isConnected ? "bg-green-500" : ""}
              >
                {connectionStatus.isConnected ? (
                  <>
                    <Wifi className="w-3 h-3 mr-1" />
                    Conectado
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 mr-1" />
                    Desconectado
                  </>
                )}
              </Badge>
              
              {connectionStatus.totalConnections > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {connectionStatus.totalConnections} {connectionStatus.totalConnections === 1 ? 'site' : 'sites'}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              Última conexão: {formatLastConnection(connectionStatus.lastConnection)}
            </div>
          </div>

          {connectionStatus.isConnected && activeConnections.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">✅ Sites Conectados:</h4>
              <div className="space-y-2">
                {activeConnections.slice(0, 3).map((connection, index) => (
                  <div key={connection.id} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <code className="bg-green-100 px-2 py-1 rounded text-xs">
                      {new URL(connection.url).hostname}
                    </code>
                    <span className="text-green-700 text-xs">
                      {formatLastConnection(connection.last_ping)}
                    </span>
                  </div>
                ))}
                {activeConnections.length > 3 && (
                  <div className="text-sm text-green-700">
                    +{activeConnections.length - 3} outros sites
                  </div>
                )}
              </div>
            </div>
          )}

          {!connectionStatus.isConnected && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ Nenhuma conexão detectada</h4>
              <p className="text-yellow-800 text-sm">
                O script ainda não foi instalado ou o fluxo não está ativo em nenhum site.
                Certifique-se de que:
              </p>
              <ul className="list-disc list-inside text-yellow-800 text-sm mt-2 space-y-1">
                <li>O código foi copiado e colado corretamente no site</li>
                <li>O fluxo está ativo</li>
                <li>A URL do site está autorizada nas configurações</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Code Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Código de Integração
          </CardTitle>
          <CardDescription>
            Código otimizado que verifica automaticamente a URL e exibe o chat apenas onde autorizado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Badge variant={flow ? "default" : "secondary"}>
              {flow ? "Fluxo Salvo" : "Salve o fluxo primeiro"}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              JavaScript
            </Badge>
            {flow && (
              <Badge variant="outline" className="font-mono text-xs">
                ID: {generateFlowCode()}
              </Badge>
            )}
          </div>

          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
              <code>{generateIntegrationCode()}</code>
            </pre>
            <Button
              onClick={handleCopyCode}
              size="sm"
              className="absolute top-2 right-2 envia-lead-gradient hover:opacity-90"
              disabled={!flow}
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copiado!" : "Copiar"}
            </Button>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Como usar:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Salve o fluxo primeiro clicando em "Salvar"</li>
              <li>2. Copie o código de integração acima</li>
              <li>3. Cole o código antes da tag &lt;/body&gt; do seu site</li>
              <li>4. O chat aparecerá automaticamente nas URLs configuradas</li>
              <li>5. Acompanhe o status da conexão nesta tela</li>
            </ol>
          </div>

          {!flow && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 text-sm">
                ⚠️ Você precisa salvar o fluxo antes de poder copiar o código de integração.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flow Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Fluxo</CardTitle>
          <CardDescription>
            Resumo das configurações que serão aplicadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">URLs de Exibição</h4>
              <p className="text-sm text-gray-600 mb-2">
                O chat aparecerá apenas nas URLs:
              </p>
              <ul className="text-sm space-y-1">
                {flowData.urls?.filter((url: string) => url.trim()).map((url: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <Globe className="w-3 h-3 text-gray-400" />
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">{url}</code>
                  </li>
                ))}
                {(!flowData.urls || flowData.urls.filter((url: string) => url.trim()).length === 0) && (
                  <li className="text-gray-500 text-xs">Todas as URLs (não restrito)</li>
                )}
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Notificações por Email</h4>
              <p className="text-sm text-gray-600 mb-2">
                Leads serão enviados para:
              </p>
              <div className="space-y-2">
                {flowData.emails?.filter((email: string) => email.trim()).map((email: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    📧 {email}
                  </Badge>
                ))}
                {(!flowData.emails || flowData.emails.filter((email: string) => email.trim()).length === 0) && (
                  <p className="text-gray-500 text-xs">Nenhum email configurado</p>
                )}
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">WhatsApp</h4>
              {flowData.whatsapp ? (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                  📱 {flowData.whatsapp}
                </Badge>
              ) : (
                <p className="text-gray-500 text-xs">WhatsApp não configurado</p>
              )}
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Perguntas</h4>
              <p className="text-sm text-gray-600">
                <strong>Total:</strong> {flowData.questions?.length || 0} pergunta(s)
              </p>
              <p className="text-sm text-gray-600">
                <strong>Mínimo para lead:</strong> {flowData.minimumQuestion || 1} resposta(s)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationCode;
