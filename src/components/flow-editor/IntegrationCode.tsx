
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

  const generateIntegrationCode = () => {
    const baseUrl = window.location.origin;
    const flowId = flow?.id || 'FLOW_ID';
    
    return `<!-- Envia Lead Chat Widget -->
<script>
(function() {
  // Configurações do widget
  var config = {
    flowId: '${flowId}',
    position: '${flowData.position}',
    colors: {
      primary: '${flowData.colors.primary}',
      secondary: '${flowData.colors.secondary}',
      text: '${flowData.colors.text}',
      background: '${flowData.colors.background}'
    },
    avatar: '${flowData.avatar}',
    apiUrl: '${baseUrl}/api'
  };

  // Criar botão flutuante
  var button = document.createElement('div');
  button.id = 'envia-lead-button';
  button.innerHTML = '💬';
  button.style.cssText = \`
    position: fixed;
    \${config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
    bottom: 20px;
    width: 60px;
    height: 60px;
    background: \${config.colors.primary};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 999999;
    font-size: 24px;
    transition: all 0.3s ease;
  \`;

  // Hover effect
  button.onmouseover = function() {
    this.style.transform = 'scale(1.1)';
  };
  button.onmouseout = function() {
    this.style.transform = 'scale(1)';
  };

  // Criar modal do chat
  var modal = document.createElement('div');
  modal.id = 'envia-lead-modal';
  modal.style.cssText = \`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 1000000;
    display: none;
    align-items: center;
    justify-content: center;
  \`;

  var chatContainer = document.createElement('div');
  chatContainer.style.cssText = \`
    width: 400px;
    height: 600px;
    background: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  \`;

  modal.appendChild(chatContainer);

  // Eventos
  button.onclick = function() {
    modal.style.display = 'flex';
    loadChat();
  };

  modal.onclick = function(e) {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  };

  function loadChat() {
    chatContainer.innerHTML = \`
      <div style="padding: 20px; text-align: center;">
        <div style="width: 40px; height: 40px; border: 4px solid \${config.colors.primary}; border-top: 4px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
        <p>Carregando chat...</p>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    \`;
    
    // Simular carregamento e iniciar chat
    setTimeout(function() {
      initChat();
    }, 1000);
  }

  function initChat() {
    chatContainer.innerHTML = \`
      <div style="background: \${config.colors.primary}; color: white; padding: 15px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 40px; height: 40px; background: \${config.colors.secondary}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">A</div>
          <div>
            <div style="font-weight: bold;">Atendimento</div>
            <div style="font-size: 12px; opacity: 0.8;">Online</div>
          </div>
        </div>
        <span onclick="document.getElementById('envia-lead-modal').style.display='none'" style="cursor: pointer; font-size: 20px;">×</span>
      </div>
      <div style="padding: 20px; height: 400px; overflow-y: auto; background: #f5f5f5;">
        <div style="background: white; padding: 15px; border-radius: 10px; margin-bottom: 10px;">
          Olá! 👋 Como posso te ajudar hoje?
        </div>
      </div>
      <div style="padding: 15px; border-top: 1px solid #eee;">
        <div style="display: flex; gap: 10px;">
          <input type="text" placeholder="Digite sua mensagem..." style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
          <button style="background: \${config.colors.primary}; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;">Enviar</button>
        </div>
      </div>
    \`;
  }

  // Adicionar elementos ao DOM
  document.body.appendChild(button);
  document.body.appendChild(modal);
})();
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
            Copie e cole este código no seu site para adicionar o chat
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
          </div>

          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono max-h-96 overflow-y-auto">
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
              <li>1. Salve o fluxo primeiro clicando em "Salvar Fluxo"</li>
              <li>2. Copie o código de integração acima</li>
              <li>3. Cole o código antes da tag &lt;/body&gt; do seu site</li>
              <li>4. O chat aparecerá automaticamente na posição configurada</li>
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
          <CardTitle>Configurações Avançadas</CardTitle>
          <CardDescription>
            Personalizações adicionais para a integração
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">URLs Permitidas</h4>
              <p className="text-sm text-gray-600 mb-2">
                O chat só aparecerá nas URLs configuradas:
              </p>
              <ul className="text-sm space-y-1">
                {flowData.urls.filter((url: string) => url.trim()).map((url: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <Globe className="w-3 h-3 text-gray-400" />
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">{url}</code>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Notificações</h4>
              <p className="text-sm text-gray-600 mb-2">
                Leads serão enviados para:
              </p>
              <ul className="text-sm space-y-1">
                {flowData.emails.filter((email: string) => email.trim()).map((email: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{email}</Badge>
                  </li>
                ))}
                {flowData.whatsapp && (
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                      WhatsApp: {flowData.whatsapp}
                    </Badge>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationCode;
