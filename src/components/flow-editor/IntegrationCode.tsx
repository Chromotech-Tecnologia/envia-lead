
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Code, Globe } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface IntegrationCodeProps {
  flow?: any;
  flowData: any;
}

const IntegrationCode = ({ flow, flowData }: IntegrationCodeProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Gerar um código único para o fluxo baseado no ID
  const generateFlowCode = () => {
    if (!flow?.id) return 'FLOW_ID_NOT_FOUND';
    
    // Criar um código mais amigável baseado no ID do fluxo
    const flowId = flow.id.replace(/-/g, '').substring(0, 16);
    return `EL_${flowId.toUpperCase()}`;
  };

  const generateIntegrationCode = () => {
    const flowCode = generateFlowCode();
    
    return `<script>
(function(a,b,c,d){
  try {
    var e=b.head||b.getElementsByTagName("head")[0];
    var f=b.createElement("script");
    f.setAttribute("src",c);
    f.setAttribute("data-flow-id",d);
    f.setAttribute("charset","UTF-8");
    f.defer=true;
    a.enviaLeadId=d;
    e.appendChild(f);
  } catch(g){console.error('[EnviaLead] Erro ao carregar script:',g);}
})(window,document,"https://fuzkdrkhvmaimpgzvimq.supabase.co/storage/v1/object/public/chat-widget/envialead-chat.js","${flowCode}")
</script>`;
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

  return (
    <div className="space-y-6">
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

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">✅ Sistema Otimizado:</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Verifica automaticamente se a URL atual está autorizada</li>
              <li>• Carrega apenas se o fluxo estiver ativo</li>
              <li>• Exibe o chat exatamente como configurado no fluxo</li>
              <li>• Sistema unificado em um único arquivo otimizado</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Como usar:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Salve o fluxo primeiro clicando em "Salvar"</li>
              <li>2. Copie o código de integração acima</li>
              <li>3. Cole o código antes da tag &lt;/body&gt; do seu site</li>
              <li>4. O chat aparecerá automaticamente nas URLs configuradas</li>
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
